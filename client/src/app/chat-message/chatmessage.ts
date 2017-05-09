export class ChatMessageModel {
  id: number;
  nickname: string;
  text: string;
  date: Date;

  constructor(nickname:string, text:string) {
    this.id = 10;
    this.nickname = nickname;
    this.text = text;
    this.date = new Date();
  }
}
