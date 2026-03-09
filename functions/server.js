[build]
  command = "npm install"
  functions = "functions"
  publish = "public"

# This redirects frontend /api calls to your serverless backend
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/api/:splat"
  status = 200