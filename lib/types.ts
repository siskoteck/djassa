export interface Categorie {
  id: number;
  nom: string;
  slug?: string;
  icone: string | null;
}

export interface Annonce {
  id: string;
  created_at: string;
  titre: string;
  prix: number;
  etat: string;
  commune: string;
  quartier: string | null;
  photos: string[];
  categorie_id: number | null;
  statut?: string;
  booste?: boolean;
  vues?: number;
  description?: string | null;
  telephone?: string | null;
  video_url?: string | null;
  user_id?: string;
}