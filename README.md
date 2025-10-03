# 🚀 Setup Rapido - The Old Friend

## Prerequisiti
✅ Node.js 18+ installato
✅ MySQL installato e avviato
✅ Git (opzionale)

## Setup in 5 Minuti

### 1️⃣ Installa Dipendenze
```bash
npm install
```

### 2️⃣ Crea il Database
Apri MySQL:
```bash
mysql -u root -p
```

Esegui:
```sql
CREATE DATABASE the_old_friend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

Importa lo schema:
```bash
mysql -u root -p the_old_friend < database/schema.sql
```

### 3️⃣ Configura Ambiente
Modifica `.env.local` con le tue credenziali MySQL:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tua_password_mysql
DB_NAME=the_old_friend
JWT_SECRET=cambia-questo-secret-123456789
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4️⃣ Crea Admin
```bash
node scripts/create-admin.js
```

Questo creerà:
- Username: `admin`
- Password: `admin123`
- Email: `admin@theoldfriend.com`

### 5️⃣ Avvia il Server
```bash
npm run dev
```

## 🎉 Fatto!

- **Sito Pubblico**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login

### Login Admin
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANTE**: Cambia la password dopo il primo login!

## 🔧 Problemi Comuni

### Errore: "Cannot connect to database"
- Verifica che MySQL sia avviato
- Controlla username/password in `.env.local`
- Verifica che il database `the_old_friend` esista

### Errore: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Errore: "Port 3000 already in use"
```bash
# Cambia porta
npm run dev -- -p 3001
```

### Admin non riesce a fare login
```bash
# Ricrea l'admin
node scripts/create-admin.js
```

## 📝 Prossimi Passi

1. **Personalizza i Dati**
   - Vai su http://localhost:3000/admin/login
   - Accedi con admin/admin123
   - Modifica servizi, barbieri, orari, impostazioni

2. **Aggiungi Immagini**
   - Carica foto barbieri in `public/images/barbers/`
   - Aggiungi immagini gallery tramite admin panel

3. **Testa le Prenotazioni**
   - Vai sul sito pubblico
   - Prova a fare una prenotazione
   - Verifica nel pannello admin

4. **Personalizza Stile**
   - Modifica colori in `app/globals.css`
   - Personalizza testi e contenuti

## 🚀 Deploy in Produzione

### Opzione 1: Vercel (Più Semplice)
1. Pusha su GitHub
2. Importa su Vercel
3. Aggiungi variabili d'ambiente
4. Deploy automatico!

### Opzione 2: VPS
1. Installa Node.js e MySQL sul server
2. Clona il repository
3. `npm install && npm run build`
4. `npm start` o usa PM2

## 📞 Hai Bisogno di Aiuto?

Controlla il file `README.md` per documentazione completa.

---

**Buon lavoro! 💈✂️**