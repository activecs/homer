#docker login --username=deduard
docker build -t deduard/homelab:homer-$(date +%Y%m%d) . --rm
docker push deduard/homelab:homer-$(date +%Y%m%d)