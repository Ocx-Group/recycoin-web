export class NetworkAffiliate {
    id: number;
    fullName: string;
    email: string;
    userName: string;
    phone: string;
    level: number;
    externalGradingId: number;
    status: number;
  
    constructor() {
      this.id = 0;
      this.fullName = '';
      this.email = '';
      this.userName = '';
      this.phone = '';
      this.level = 0;
      this.externalGradingId = 0;
      this.status = 0;
    }
  }
