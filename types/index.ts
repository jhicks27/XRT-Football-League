export type UserRole = "user" | "admin" | "executive";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl: string;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  conference: string;
  division: string;
  createdAt: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  touchdowns: number;
  passingYards: number;
  rushingYards: number;
  receivingYards: number;
  completions: number;
  attempts: number;
  tackles: number;
  sacks: number;
  interceptions: number;
  pbu: number;
  fumbles: number;
  pancakes: number;
  fieldGoals: number;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  teamName?: string;
  number: string | number;
  position: string;
  imageUrl: string;
  height: string;
  weight: number;
  age: number;
  experience: string;
  stats: PlayerStats;
  createdAt: string;
}

export interface Game {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  homeScore: number;
  awayScore: number;
  date: string;
  time: string;
  venue: string;
  status: "scheduled" | "in_progress" | "final";
  week: number;
  season: string;
  highlightYoutubeUrls?: string[];
  recap?: string;
}

export interface PlayoffMatchup {
  id: string;
  round: number;
  matchupNumber: number;
  team1Id: string | null;
  team2Id: string | null;
  team1Name: string;
  team2Name: string;
  team1Logo: string;
  team2Logo: string;
  team1Score: number;
  team2Score: number;
  winnerId: string | null;
  status: "pending" | "in_progress" | "final";
}

export interface PlayoffRound {
  round: number;
  name: string;
  matchups: PlayoffMatchup[];
}

export interface Championship {
  id: string;
  season: string;
  winnerTeamId: string;
  winnerTeamName: string;
  winnerTeamLogo: string;
  runnerUpTeamId: string;
  runnerUpTeamName: string;
  mvpPlayerId: string;
  mvpPlayerName: string;
  mvpPlayerImage: string;
  finalScore: string;
  highlightImages: string[];
  highlightVideos: string[];
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "game" | "trade" | "injury" | "announcement" | "playoff" | "championship";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface MvpVote {
  id: string;
  playerId: string;
  playerName: string;
  userId: string;
  season: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: "youtube" | "image" | "video";
  url: string;
  thumbnailUrl?: string;
  category: "highlight" | "interview" | "recap" | "announcement";
  gameId?: string;
  teamId?: string;
  playerId?: string;
  featured: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  createdAt: string;
}

export interface SeasonArchive {
  id: string;
  season: string;
  championTeamName: string;
  championTeamLogo: string;
  mvpPlayerName: string;
  finalRecord: string;
  totalGames: number;
  totalPlayers: number;
  totalTeams: number;
  topScorer: string;
  topScorerTDs: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: "team" | "player" | "game" | "playoff" | "championship" | "user";
  entityId: string;
  userId: string;
  userName: string;
  details: string;
  createdAt: string;
}
