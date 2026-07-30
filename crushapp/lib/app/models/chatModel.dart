class ChatModel {
  int? chatId;
  int? appUserId;
  int? receiverId;
  String? dateTime;
  String? message;
  bool isSender = false;

  ChatModel(
      {this.chatId,
      this.appUserId,
      this.receiverId,
      this.dateTime,
      this.message,
      required this.isSender});

  ChatModel.fromJson(Map<String, dynamic> json) {
    chatId = json['ChatId'];
    appUserId = json['AppUserId'];
    receiverId = json['ReceiverId'];
    dateTime = json['DateTime'];
    message = json['Message'];
    isSender = json['IsSender'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['ChatId'] = this.chatId;

    data['ReceiverId'] = this.receiverId;
    data['DateTime'] = this.dateTime;
    data['Message'] = this.message;
    data['IsSender'] = this.isSender;
    return data;
  }
}
