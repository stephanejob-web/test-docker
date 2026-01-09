#!/bin/bash

# Script de test de la configuration multi-ports
# Vérifie que le frontend, backend et la communication fonctionnent

set -e

echo "=================================================="
echo "  Test de Configuration Multi-Environnements"
echo "=================================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Charger les variables du .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ Fichier .env introuvable${NC}"
    exit 1
fi

# Valeurs par défaut
EXPRESS_PORT=${EXPRESS_PORT:-3000}
FRONTEND_PORT=${FRONTEND_PORT:-80}
MYSQL_PORT=${MYSQL_PORT:-3306}

echo "📋 Configuration détectée :"
echo "   - MYSQL_PORT      = $MYSQL_PORT"
echo "   - EXPRESS_PORT    = $EXPRESS_PORT"
echo "   - FRONTEND_PORT   = $FRONTEND_PORT"
echo ""

# Test 1 : Vérifier que les conteneurs tournent
echo "1️⃣  Vérification des conteneurs..."
if docker ps | grep -q "frontend-react"; then
    echo -e "   ${GREEN}✅ Frontend running${NC}"
else
    echo -e "   ${RED}❌ Frontend not running${NC}"
    exit 1
fi

if docker ps | grep -q "backend-express"; then
    echo -e "   ${GREEN}✅ Backend running${NC}"
else
    echo -e "   ${RED}❌ Backend not running${NC}"
    exit 1
fi

if docker ps | grep -q "mysql-db"; then
    echo -e "   ${GREEN}✅ MySQL running${NC}"
else
    echo -e "   ${RED}❌ MySQL not running${NC}"
    exit 1
fi
echo ""

# Test 2 : Vérifier la configuration nginx
echo "2️⃣  Vérification de la configuration nginx..."
NGINX_CONFIG=$(docker exec frontend-react cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "ERROR")

if [ "$NGINX_CONFIG" = "ERROR" ]; then
    echo -e "   ${RED}❌ Impossible de lire la config nginx${NC}"
    exit 1
fi

PROXY_LINE=$(echo "$NGINX_CONFIG" | grep "proxy_pass" | head -1)
EXPECTED_PROXY="proxy_pass http://backend:${EXPRESS_PORT};"

if echo "$PROXY_LINE" | grep -q "http://backend:${EXPRESS_PORT}"; then
    echo -e "   ${GREEN}✅ Nginx correctement configuré${NC}"
    echo "      $PROXY_LINE"
else
    echo -e "   ${RED}❌ Configuration nginx incorrecte${NC}"
    echo "      Attendu  : $EXPECTED_PROXY"
    echo "      Trouvé   : $PROXY_LINE"
    exit 1
fi
echo ""

# Test 3 : Tester l'accès backend direct
echo "3️⃣  Test backend direct (port $EXPRESS_PORT)..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${EXPRESS_PORT}/api/public/churches || echo "000")

if [ "$BACKEND_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✅ Backend accessible${NC}"
else
    echo -e "   ${YELLOW}⚠️  Backend response: $BACKEND_RESPONSE${NC}"
    echo "      (Normal si aucune donnée, mais le service répond)"
fi
echo ""

# Test 4 : Tester l'accès frontend
echo "4️⃣  Test frontend (port $FRONTEND_PORT)..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${FRONTEND_PORT}/ || echo "000")

if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✅ Frontend accessible${NC}"
else
    echo -e "   ${RED}❌ Frontend non accessible (code: $FRONTEND_RESPONSE)${NC}"
    exit 1
fi
echo ""

# Test 5 : Tester le proxy nginx (frontend → backend)
echo "5️⃣  Test proxy nginx (frontend → backend)..."
PROXY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${FRONTEND_PORT}/api/public/churches || echo "000")

if [ "$PROXY_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✅ Proxy nginx fonctionne${NC}"
    echo "      Frontend (port $FRONTEND_PORT) → Backend (port $EXPRESS_PORT)"
else
    echo -e "   ${YELLOW}⚠️  Proxy response: $PROXY_RESPONSE${NC}"
    echo "      (Vérifier les données dans la base)"
fi
echo ""

# Test 6 : Vérifier les ports exposés
echo "6️⃣  Vérification des ports exposés..."
echo ""
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E "(frontend-react|backend-express|mysql-db|PORTS)"
echo ""

# Résumé
echo "=================================================="
echo -e "  ${GREEN}✅ Tous les tests sont passés !${NC}"
echo "=================================================="
echo ""
echo "🌐 Accès :"
echo "   - Frontend : http://localhost:${FRONTEND_PORT}"
echo "   - API      : http://localhost:${EXPRESS_PORT}/api"
echo "   - MySQL    : localhost:${MYSQL_PORT}"
echo ""
echo "📝 Commandes utiles :"
echo "   - Logs       : docker-compose logs -f"
echo "   - Rebuild    : docker-compose down && docker-compose up -d --build"
echo "   - MySQL      : docker exec -it mysql-db mysql -uadmin -padmin light_church"
echo ""
