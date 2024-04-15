import color from 'color';
import type {JamRoom, CompletedJamRoomColors} from "$lib/types";

const defaultColors = {
  background: 'white',
  header: 'black',
  text: '#4b5563',
  link: '#60a5fa',
  buttonPrimary: '#4B5563',
  buttonSecondary: '#e5e7eb',
};

export const colors = (room?: JamRoom): CompletedJamRoomColors => {
  const currentColors = room ? {
    ...defaultColors,
    ...room.theme?.colors,
    buttonPrimary: room.color || defaultColors.buttonPrimary,
  } : defaultColors;

  return {
    ...currentColors,
    textLight: color(currentColors.text).lighten(0.1).hex(),
    textSuperLight: color(currentColors.text).lighten(0.2).hex(),
  };
};
