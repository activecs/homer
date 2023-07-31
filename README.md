<h1>
 <img
  width="180"
  alt="Homer's donut"
  src="https://raw.githubusercontent.com//bastienwirtz/homer/main/public/logo.png">
    <br/>
    It's a fork of Homer Dashboard with some changes:
    <br/>
    - Added services: Tailscale, Transmission, Nextcloud, Cloudflare
    <br/>
    - Added nginx reverse proxy to deal with CORS issues 
</h1>

### Build manually

```sh
# Using yarn
yarn install
yarn build
# **OR** Using npm
npm install
npm run build
```

Then your dashboard is ready to use in the `/dist` directory.
