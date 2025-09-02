#!/bin/bash
docker build -t mandal-backend .
docker tag mandal-backend:latest myregistry/mandal-backend:latest
docker push myregistry/mandal-backend:latest
kubectl apply -f k8s/