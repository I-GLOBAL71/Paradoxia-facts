export interface ParanormalFact {
  id: string;
  title: string;
  summary: string;
  details: string;
  category: 
    | 'Ghost' | 'Witchcraft' | 'Cryptid' | 'UFO' | 'Supernatural Phenomenon'
    | 'Fantôme' | 'Sorcellerie' | 'Créature' | 'OVNI' | 'Phénomène Surnaturel';
  videoUrl: string; // Using a direct URL for simplicity instead of a prompt
  imageUrl: string; // Using a direct URL for simplicity
}