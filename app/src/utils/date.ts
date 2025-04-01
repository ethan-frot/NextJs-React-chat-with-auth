import {parseISO, format} from 'date-fns';

export const formatMessageDate = (dateString: string) => {
    try {
        const date = parseISO(dateString);
        const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000,
        );
        const now = new Date();
        const diffInDays =
            (now.getTime() - localDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffInDays < 1) {
            return format(localDate, 'HH:mm');
        } else if (diffInDays < 7) {
            return format(localDate, 'EEEE HH:mm');
        } else {
            return format(localDate, 'dd/MM/yyyy HH:mm');
        }
    } catch (error) {
        console.error('Erreur lors du formatage de la date:', error);
    }
};
