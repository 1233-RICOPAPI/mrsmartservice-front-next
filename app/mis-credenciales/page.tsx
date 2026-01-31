'use client';

import React from 'react';

type Cred = {
  credential_id: number;
  software_id: number;
  software_name: string | null;
  order_id: number;
  username: string;
  created_at: string;
};

export default function MisCredencialesPage() {
  const [orderId, setOrderId] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [creds, setCreds] = React.useState<Cred[]>([]);
  const [buyerName, setBuyerName] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = React.useState<Record<number, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreds([]);
    setBuyerName(null);
    setStatus(null);

    const oid = Number(orderId);
    if (!Number.isFinite(oid) || oid <= 0) {
      setError('Escribe un número de pedido (order_id) válido.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Escribe un correo válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/customer-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: oid, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError('No se pudo validar tu pedido con ese correo. Revisa los datos e intenta de nuevo.');
        return;
      }
      setBuyerName(data?.buyer_name ?? null);
      setStatus(data?.status ?? null);
      setCreds(Array.isArray(data?.credentials) ? data.credentials : []);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function regenerate(credential_id: number) {
    const oid = Number(orderId);
    if (!Number.isFinite(oid) || oid <= 0) return;
    setError(null);
    try {
      const res = await fetch('/api/customer-credentials/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: oid, email, credential_id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok || !data?.password) {
        setError('No se pudo regenerar la clave.');
        return;
      }
      setLastGenerated((prev) => ({ ...prev, [credential_id]: String(data.password) }));
      try {
        await navigator.clipboard.writeText(String(data.password));
      } catch {}
    } catch {
      setError('Error de conexión regenerando la clave.');
    }
  }

  function copyText(t: string) {
    try {
      navigator.clipboard.writeText(t);
    } catch {}
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">Mis credenciales</h1>
        <p className="mt-2 text-sm text-gray-600">
          Escribe el <b>número de pedido (order_id)</b> y el <b>correo</b> con el que compraste.
          Si no recuerdas la clave (porque solo se muestra al generarla), puedes <b>regenerarla</b> aquí.
        </p>

        <form onSubmit={onSubmit} className="mt-6 rounded-xl border p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Pedido (order_id)</label>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ej: 1024"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Correo</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@gmail.com"
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          {error ? <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-60"
          >
            {loading ? 'Validando…' : 'Ver mis credenciales'}
          </button>
        </form>

        {(buyerName || status) && (
          <div className="mt-6 rounded-xl border p-4">
            <div className="text-sm text-gray-700">
              {buyerName ? (
                <div>
                  Comprador: <b>{buyerName}</b>
                </div>
              ) : null}
              {status ? (
                <div>
                  Estado: <b>{status}</b>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="mt-6">
          {creds.length === 0 ? (
            <p className="text-sm text-gray-600">Aún no hay credenciales asociadas a este pedido.</p>
          ) : (
            <div className="space-y-3">
              {creds.map((c) => {
                const newPass = lastGenerated[c.credential_id];
                const softwareLabel = c.software_name ? `${c.software_name} (ID ${c.software_id})` : `Software ID ${c.software_id}`;
                return (
                  <div key={c.credential_id} className="rounded-xl border p-4 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm text-gray-500">{softwareLabel}</div>
                        <div className="mt-1 text-lg font-semibold">Usuario: {c.username}</div>
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row">
                        <button
                          type="button"
                          onClick={() => copyText(c.username)}
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
                          Copiar usuario
                        </button>
                        <button
                          type="button"
                          onClick={() => regenerate(c.credential_id)}
                          className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
                        >
                          Regenerar clave
                        </button>
                      </div>
                    </div>

                    {newPass ? (
                      <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                        <div>
                          Nueva clave: <b>{newPass}</b>
                        </div>
                        <div className="mt-2 flex flex-col gap-2 md:flex-row">
                          <button
                            type="button"
                            onClick={() => copyText(newPass)}
                            className="rounded-lg border px-3 py-2 text-sm"
                          >
                            Copiar clave
                          </button>
                          <button
                            type="button"
                            onClick={() => copyText(`Software ID: ${c.software_id}\nUsuario: ${c.username}\nClave: ${newPass}`)}
                            className="rounded-lg border px-3 py-2 text-sm"
                          >
                            Copiar todo
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-green-700">
                          Nota: por seguridad, la clave solo se muestra cuando la regeneras.
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-gray-500">
                        La clave no se muestra aquí. Si la necesitas, usa “Regenerar clave”.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
