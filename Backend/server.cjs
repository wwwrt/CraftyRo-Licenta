require('dotenv').config()
const express = require('express')
const Stripe = require('stripe')
const cors = require('cors')

const app = express()
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

app.use(cors())
app.use(express.json())

app.post('/create-checkout-session', async (req, res) => {
  const { products } = req.body
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: products.map(p => ({
        price_data: {
          currency: 'ron',
          product_data: {
            name: p.name,
            images: [p.image],
          },
          unit_amount: Math.round(p.price * 100), // Stripe folosește bani în bani (bani = 1/100 RON)
        },
        quantity: p.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/orders?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/cart?canceled=true`,
    })
    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 4242
app.listen(PORT, () => console.log(`Stripe backend running on port ${PORT}`))