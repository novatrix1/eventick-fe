
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};


export const formatEventDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};


export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  if (timeString.includes('T')) {
    const date = new Date(timeString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return timeString;
};


export const calculateDaysLeft = (dateString: string): number => {
  if (!dateString) return 0;
  const eventDate = new Date(dateString);
  const today = new Date();
  const timeDiff = eventDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};
