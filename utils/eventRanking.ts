import { Event } from '@/types';

export const rankEventForBanner = (event: Event): number => {
    let score = 0;

    // 1️⃣ Event actif
    if (event.isActive) score += 30;

    // 2️⃣ Tickets disponibles
    if (event.availableTickets > 0) score += 30;

    // 3️⃣ Proximité dans le temps
    const eventDate = new Date(event.date).getTime();
    const now = Date.now();
    const diffDays = (eventDate - now) / (1000 * 60 * 60 * 24);

    if (diffDays >= 0 && diffDays <= 7) score += 20; // cette semaine
    else if (diffDays > 7 && diffDays <= 30) score += 10;

    // 4️⃣ Popularité (optionnel)
    if ((event.totalTickets - event.availableTickets) > 20) {
        score += 10;
    }

    return score;
};



export const rankEventForYou = (
    event: Event,
    options: {
        selectedCategory: string;
        userCity?: string;
    }
): number => {
    let score = 0;

    // 1️⃣ Actif + billets
    if (event.isActive && event.availableTickets > 0) score += 30;

    // 2️⃣ Catégorie sélectionnée
    if (
        options.selectedCategory !== 'all' &&
        event.category === options.selectedCategory
    ) {
        score += 25;
    }

    // 3️⃣ Ville utilisateur
    if (options.userCity && event.city === options.userCity) {
        score += 20;
    }

    // 4️⃣ Proximité dans le temps
    const eventDate = new Date(event.date).getTime();
    const now = Date.now();
    const diffDays = (eventDate - now) / (1000 * 60 * 60 * 24);

    if (diffDays >= 0 && diffDays <= 7) score += 15;
    else if (diffDays <= 30) score += 8;

    // 5️⃣ Popularité simple
    const sold = event.totalTickets - event.availableTickets;
    if (sold > 20) score += 10;

    return score;
};


export const rankEventPopular = (event: Event): number => {
    let score = 0;

    // 1️⃣ Event actif
    if (event.isActive) score += 20;

    // 2️⃣ Tickets vendus
    const soldTickets = event.totalTickets - event.availableTickets;
    score += soldTickets * 2;

    // 3️⃣ Taux de remplissage
    const fillRate =
        event.totalTickets > 0
            ? soldTickets / event.totalTickets
            : 0;

    if (fillRate >= 0.8) score += 30;
    else if (fillRate >= 0.5) score += 20;
    else if (fillRate >= 0.3) score += 10;

    // 4️⃣ Proximité temporelle
    const eventDate = new Date(event.date).getTime();
    const now = Date.now();
    const diffDays = (eventDate - now) / (1000 * 60 * 60 * 24);

    if (diffDays >= 0 && diffDays <= 7) score += 15;
    else if (diffDays <= 30) score += 8;

    return score;
};
