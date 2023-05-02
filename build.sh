docker build -t deduard/homelab:homer . --rm
docker login --username=deduard
docker push deduard/homelab:homer