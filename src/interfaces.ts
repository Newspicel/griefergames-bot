export interface Options {
  username?: string;
  password?: string;
  // for mcleaks my fork of minecraft-protocol (https://github.com/Neocraftr/node-minecraft-protocol) is needed
  auth?: 'mojang' | 'microsoft' | 'mcleaks';
  logMessages?: boolean | LogMessagesOptions;
  additionalChatDelay?: number;
  solveAfkChallenge?: boolean;
  setPortalTimeout?: boolean;
  // proxy?: Proxy
  profilesFolder?: string | false;
}

export interface LogMessagesOptions {
  type: 'uncoded' | 'encoded' | 'ansi';
}

// export interface Proxy {
//   host: string;
//   port: number;
//   username?: string;
//   password?: string;
// }

export interface Session {
  accessToken: string;
  clientToken: string;
  selectedProfile: {
    id: string;
    name: string;
    [key: string]: any;
  };
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface ConnectorOptions {
  name: string;
  start: number;
  front: number[];
  portal: number[];
}
