export async function createStripeCheckoutSession(products) {
  const res = await fetch('http://localhost:4242/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  })
  if (!res.ok) throw new Error('Stripe session error')
  return res.json()
}
