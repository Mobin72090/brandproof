import httpx
import re

def check_live():
    frontend_url = 'https://brandproof-two.vercel.app'
    backend_url = 'https://brandproof-api-c5jf.onrender.com'

    print("Checking Frontend:", frontend_url)
    with httpx.Client(timeout=15.0) as client:
        fe = client.get(frontend_url)
        print("Frontend status:", fe.status_code)
        matches = re.findall(r'src="([^"]+\.js)"', fe.text)
        print("Scripts:", matches)
        for s in matches:
            s_url = frontend_url + s
            js = client.get(s_url).text
            renders = re.findall(r'https://[^"]*onrender\.com', js)
            print("Found backend URLs in JS bundle:", set(renders))

        print("\nChecking Backend CORS with Origin:", frontend_url)
        # Test OPTIONS preflight
        preflight = client.options(
            f"{backend_url}/api/brands",
            headers={
                "Origin": frontend_url,
                "Access-Control-Request-Method": "GET",
            }
        )
        print("Preflight status:", preflight.status_code)
        print("Preflight Allow-Origin header:", preflight.headers.get("access-control-allow-origin"))

        # Test GET /api/brands with Origin
        brands_res = client.get(
            f"{backend_url}/api/brands",
            headers={"Origin": frontend_url}
        )
        print("GET /api/brands status:", brands_res.status_code)
        print("GET /api/brands Allow-Origin header:", brands_res.headers.get("access-control-allow-origin"))
        brands = brands_res.json()
        print("Brands count on Render:", len(brands))
        if brands:
            print("Brand #1:", brands[0]["name"])

if __name__ == '__main__':
    check_live()
