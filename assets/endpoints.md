# API Documentation - EventMR Plateforme de Billetterie

## Table des matières
- [1. Authentification](#1-authentification)
- [2. Inscription](#2-inscription)
- [3. Accueil Client](#3-accueil-client)
- [4. Détails Événement](#4-détails-événement)
- [5. Réservation](#5-réservation)
- [6. Exploration](#6-exploration)
- [7. Gestion Billets](#7-gestion-billets)
- [8. Notifications](#8-notifications)
- [9. Profil Utilisateur](#9-profil-utilisateur)
- [10. Tableau de Bord Organisateur](#10-tableau-de-bord-organisateur)
- [11. Gestion Événements](#11-gestion-événements)
- [12. Paiements Organisateur](#12-paiements-organisateur)

---

## 1. Authentification

### 1.1 Connexion (POST)
**Endpoint** : `/api/auth/login`  
**Méthode** : POST  
**Authentification** : Non requise

**Requête** :
```json
{
  "email": "client@gmail.com",
  "password": "motDePasse123"
}
```
---
**Réponses :**

✅ **Succès (200)** :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "role": "client"
  }
}
```
---

❌ **Erreur (401)** :
```json
{
  "success": false,
  "message": "Email ou mot de passe invalide"
}
```
---


### 1.2 Récupération Profil (GET)
**Endpoint** : `/api/auth/profile`  
**Méthode** : GET  
**Authentification** : Bearer Token

**Réponses** :

✅ **Succès (200)** :
```json
{
  "success": true,
  "user": {
    "role": "client",
    "nom": "Doe",
    "prenom": "John",
    "email": "client@gmail.com",
    "telephone": "+22212345678",
    "imageProfile": "https://exemple.com/avatar.jpg",
    "adresse": "Nouakchott, Mauritanie"
  }
}
```
---

❌ **Erreur (401)** :
```json
{
  "success": false,
  "message": "Token invalide ou expiré"
}
```
---

## 2. Inscription

### 2.1 Client (POST)
**Endpoint** : `/api/auth/register/client`  
**Méthode** : POST  

**Requête** :
```json
{
  "fullName": "John Doe",
  "email": "client@example.com",
  "phone": "+22212345678",
  "password": "motdepasse123"
}

```
---

**Réponses** :

✅ **Succès (200)** :
```json
{
  "success": true,
  "message": "Code OTP envoyé au +22212345678",
  "userId": "1234567890",
  "otpExpiry": 300
}

```
---

❌ **Erreur (400)** :
```json
{
  "success": false,
  "message": "Email déjà utilisé"
}
```
---

### 2.2 Organisateur (POST)
**Endpoint** : `/api/auth/register/organizer`  
**Méthode** : POST  

**Requête** :
```json
{
  "fullName": "Ba Ablay",
  "email": "organizer@example.com",
  "phone": "+22287654321",
  "password": "motdepasse123",
  "companyName": "EventPro",
  "organizerType": "entreprise",
  "address": "123 Rue de l'événement, Nouakchott",
  "rib": "MR12345678",
  "socialMedia": "https://facebook.com/eventpro",
  "description": "Organisation d'événements culturels"
}

```
---

**Réponses** :

✅ **Succès (200)** :
```json
{
  "success": true,
  "message": "Compte en attente de vérification",
  "userId": "org_123456"
}

```
---

❌ **Erreur (400)** :
```json
{
  "success": false,
  "message": "Registre de commerce requis pour les entreprises"
}
```
---

### 2.3 Vérification OTP (POST)
**Endpoint** : `/api/auth/verify-otp`  
**Méthode** : POST  

**Requête** :
```json
{
  "userId": "1234567890",
  "otp": "123456"
}

```
---

**Réponses** :

✅ **Succès (200)** :
```json
{
  "success": true,
  "message": "Compte client activé",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "role": "client"
  }
}

```
---

❌ **Erreur (401)** :
```json
{
  "success": false,
  "message": "Code OTP invalide"
}

```
---



## 3. Accueil Client

### 3.1 Page d'Accueil (GET)
**Endpoint** : `/api/home`  
**Méthode** : GET  

**Réponse** :
```json
{
  "success": true,
  "featuredEvent": {
    "id": "event_123",
    "title": "Festival du Chameau",
    "date": "2023-10-12",
    "endDate": "2023-10-15",
    "location": "Nouakchott",
    "image": "https://test.com/image.jpg",
    "category": "culture"
  },
  "categories": [
    {"id": "concerts", "name": "Concerts", "icon": "musical-notes"}
  ],
  "recommendedEvents": [
    {
      "id": "event_456",
      "title": "Festival des Dattes",
      "date": "2023-09-15",
      "location": "Nouakchott",
      "price": 1500,
      "category": "culture",
      "promo": true
    }
  ]
}
```
---


### 3.2 Événements Proches (GET)
**Endpoint** : `/api/events/nearby`  
**Méthode** : GET  
**Headers** : `Location: Nouakchott` (optionnel)  

**Réponse** :
```json
{
  "success": true,
  "events": [
    {
      "id": "event_789",
      "title": "Match de Football",
      "date": "2023-09-20",
      "location": "Nouadhibou",
      "distance": "5 km",
      "price": 2000
    }
  ]
}

```
---


## 4. Détails Événement

### 4.1 Fiche Événement (GET)
**Endpoint** : `/api/events/:eventId`  
**Méthode** : GET  

**Réponse** :
```json
{
  "success": true,
  "event": {
    "id": "event_123",
    "title": "Festival des Dattes",
    "date": "15 Septembre 2023",
    "time": "18:00 - 23:00",
    "location": "Nouakchott",
    "price": 1500,
    "promo": true,
    "description": "Description longue..."
  }
}

```
---

### 4.2 Types de Billets (GET)
**Endpoint** : `/api/events/:eventId/ticket-types`  
**Méthode** : GET  

**Réponse** :
```json
{
  "success": true,
  "ticketTypes": [
    {
      "id": "standard",
      "name": "Pass Standard",
      "price": 1500,
      "features": ["Accès à toutes les zones"],
      "available": 100
    }
  ]
}

```
---

## 5. Réservation

### 5.1 Soumettre Réservation (POST)
**Endpoint** : `/api/tickets/book`  
**Méthode** : POST  
**Authentification** : Bearer Token  
**Format** : multipart/form-data  

**Requête** :
```json
{
  "eventId": "event_123",
  "ticketTypeId": "vip",
  "quantity": 2,
  "paymentMethod": "bankily",
  "attendeeFullName": "Ibrahima Dem"
}

```
---

**Réponse** :
```json
{
  "success": true,
  "message": "Réservation en attente de vérification",
  "booking": {
    "id": "book_789",
    "bookingNumber": "873953957",
    "totalPrice": 10000,
    "status": "pending"
  }
}
```
---


## 6. Exploration

### 6.1 Recherche Événements (GET)
**Endpoint** : `/api/events/search`  
**Méthode** : GET  

**Paramètres** :
- `q` : Terme de recherche
- `location` : Ville (ex: "Nouakchott")
- `category` : ID catégorie

**Réponse** :
```json
{
  "success": true,
  "total": 15,
  "events": [
    {
      "id": "event_123",
      "title": "Festival des Dattes",
      "date": "15 Sept 2023",
      "location": "Stade Olympique",
      "price": 1500,
      "category": "culture"
    }
  ]
}

```
---


## 7. Gestion Billets

### 7.1 Lister Billets (GET)
**Endpoint** : `/api/tickets`  
**Méthode** : GET  
**Authentification** : Bearer Token  
**Paramètres** : `status=active`  

**Réponse** :
```json
{
  "success": true,
  "tickets": [
    {
      "id": "ticket_123",
      "eventId": "event_456",
      "title": "Festival du Chameau",
      "date": "2023-10-15T18:00:00",
      "location": "Place de la Grande Mosquée",
      "price": 2500,
      "status": "active"
    }
  ]
}

```
---


## 8. Notifications

### 8.1 Récupérer Notifications (GET)
**Endpoint** : `/api/notifications`  
**Méthode** : GET  
**Authentification** : Bearer Token  

**Réponse** :
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notif_123",
      "title": "Nouveau concert traditionnel",
      "message": "Description...",
      "read": false
    }
  ],
  "unreadCount": 3
}

```
---

## 9. Profil Utilisateur

### 9.1 Mettre à Jour Profil (PUT)
**Endpoint** : `/api/user/profile`  
**Méthode** : PUT  
**Authentification** : Bearer Token  

**Requête** :
```json
{
  "fullName": "Nouveau Nom",
  "email": "nouveau@email.mr"
}

```
---


**Réponse** :
```json
{
  "success": true,
  "message": "Profil mis à jour",
  "user": {
    "fullName": "Nouveau Nom",
    "email": "nouveau@email.mr"
  }
}

```
---


## 10. Tableau de Bord Organisateur

### 10.1 Statistiques (GET)
**Endpoint** : `/api/organizer/stats`  
**Méthode** : GET  
**Authentification** : Bearer Token (Organisateur)  

**Réponse** :
```json
{
  "success": true,
  "stats": {
    "sales": 1245,
    "revenue": 3735000,
    "fillRate": 78
  }
}

```
---


## 11. Gestion Événements

### 11.1 Créer Événement (POST)
**Endpoint** : `/api/events`  
**Méthode** : POST  
**Authentification** : Bearer Token (Organisateur)  
**Format** : multipart/form-data  

**Requête** :
```json
{
  "title": "Festival du Désert",
  "description": "Description...",
  "date": "2023-10-15T18:00:00Z",
  "location": "Nouakchott",
  "totalCapacity": 500
}

```
---

**Réponse** :
```json
{
  "success": true,
  "message": "Événement créé avec succès",
  "eventId": "event_123"
}

```
---


## 12. Paiements Organisateur

### 12.1 Demande de Retrait (POST)
**Endpoint** : `/api/payments/withdraw`  
**Méthode** : POST  
**Authentification** : Bearer Token (Organisateur)  

**Requête** :
```json
{
  "amount": 100000,
  "method": "bankily"
}

```
---

**Réponse** :
```json
{
  "success": true,
  "transactionId": "TX123456789",
  "receiptUrl": "https://api.eventmr.com/receipts/rec123.pdf"
}

```
---