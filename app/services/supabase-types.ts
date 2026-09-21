// eslint-disable-next-line @typescript-eslint/naming-convention
export type Database = {
  public: {
    Tables: {
      contas: {
        Row: {
          id: string;
          acctid: string;
          accttype: string;
          bankid: number;
          branchid: string;
          description: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          acctid: string;
          accttype?: string;
          bankid?: number;
          branchid?: string;
          description?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          acctid?: string;
          accttype?: string;
          bankid?: number;
          branchid?: string;
          description?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      bancos: {
        Row: {
          id: string;
          name: string;
          alias: string;
        };
        Insert: {
          id: string;
          name?: string;
          alias?: string;
        };
        Update: {
          id?: string;
          name?: string;
          alias?: string;
        };
        Relationships: [];
      };
      extratos: {
        Row: {
          id: string;
          account_id: string;
          trntype: string;
          dtposted: string;
          trnamt: number;
          memo: string;
          chknum: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          trntype?: string;
          dtposted: string;
          trnamt?: number;
          memo?: string;
          chknum?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          trntype?: string;
          dtposted?: string;
          trnamt?: number;
          memo?: string;
          chknum?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      saldos: {
        Row: {
          id: string;
          account_id: string;
          balance: number;
          enddate: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          balance?: number;
          enddate: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          balance?: number;
          enddate?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
