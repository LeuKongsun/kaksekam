import { authenticate, defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/seller-listings*",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/seller-profile*",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/saved-listings*",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/saved-searches*",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/listing-uploads*",
      bodyParser: {
        sizeLimit: "32mb",
      },
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/seller-inquiries*",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/buyer-inquiries*",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/listing-inquiries*",
      middlewares: [
        authenticate("customer", "bearer", { allowUnauthenticated: true }),
      ],
    },
    {
      matcher: "/admin/listing-moderation*",
      middlewares: [authenticate("user", ["bearer", "session"])],
    },
    {
      matcher: "/admin/inquiries*",
      middlewares: [authenticate("user", ["bearer", "session"])],
    },
    {
      matcher: "/admin/marketplace*",
      middlewares: [authenticate("user", ["bearer", "session"])],
    },
    {
      matcher: "/admin/sellers*",
      middlewares: [authenticate("user", ["bearer", "session"])],
    },
  ],
})
