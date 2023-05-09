#docker login --username=deduard
docker build -t deduard/homelab:homer . --rm
docker push deduard/homelab:homer