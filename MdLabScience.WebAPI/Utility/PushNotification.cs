using Newtonsoft.Json;
using System;
using System.IO;
using System.Net;
using System.Text;

namespace MdLabScience.Utility
{
    public class PushNotification
    {
        public static void PushNotificationTOuser(String Token, String ResponseMessage, String alert)
        {
            try
            {
                var serverKey = "AAAAfunCKT0:APA91bGgCeWxx-TGnt2uuUwPh65oGc7vLyZbhhAwsKuu8ju0Icb3Up5VGGSib5AiflI0zf5U9hgPn9OJCdJf8cSxOxOIH-l65yhjUHggY0FdRXeUdJlDibfFixIN23HX0GgTt1mTN2do";
                var senderId = "545087695165";
                var result = "-1";

                var httpWebRequest = (HttpWebRequest)WebRequest.Create("https://fcm.googleapis.com/fcm/send");
                httpWebRequest.ContentType = "application/json";
                httpWebRequest.Headers.Add(string.Format("Authorization: key={0}", serverKey));
                httpWebRequest.Headers.Add(string.Format("Sender: id={0}", senderId));
                httpWebRequest.Method = "POST";

                var payload = new
                {
                    notification = new
                    {
                        title = alert,
                        body = ResponseMessage,
                        sound = "default",
                        titleLocKey = "block",
                    },
                    data = new
                    {
                        info = "Crush App"
                    },
                    to = Token,
                    priority = "high",
                    content_available = true,
                };

                using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
                {
                    string json = JsonConvert.SerializeObject(payload);
                    streamWriter.Write(json);
                    streamWriter.Flush();
                }

                var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
                using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    result = streamReader.ReadToEnd();
                }
            }
            catch (Exception ex)
            {
            }
        }

        public static void PushNotificationScreenShot(String Token, String ResponseMessage, String alert, String ImagePath)
        {
            try
            {
                var serverKey = "AAAAfunCKT0:APA91bGgCeWxx-TGnt2uuUwPh65oGc7vLyZbhhAwsKuu8ju0Icb3Up5VGGSib5AiflI0zf5U9hgPn9OJCdJf8cSxOxOIH-l65yhjUHggY0FdRXeUdJlDibfFixIN23HX0GgTt1mTN2do";
                var senderId = "545087695165";
                var result = "-1";

                var httpWebRequest = (HttpWebRequest)WebRequest.Create("https://fcm.googleapis.com/fcm/send");
                httpWebRequest.ContentType = "application/json";
                httpWebRequest.Headers.Add(string.Format("Authorization: key={0}", serverKey));
                httpWebRequest.Headers.Add(string.Format("Sender: id={0}", senderId));
                httpWebRequest.Method = "POST";

                var payload = new
                {
                    notification = new
                    {
                        title = "Screenshot",
                        body = ResponseMessage,
                        sound = "default",
                        image = "http://crashcourseonlin.net/" + ImagePath
                    },
                    data = new
                    {
                        info = "Crush App",
                        image = "http://crashcourseonlin.net/" + ImagePath
                    },
                    fcm_options = new
                    {
                        image = "http://crashcourseonlin.net/" + ImagePath
                    },
                    to = Token,
                    priority = "high",
                    content_available = true,
                };

                using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
                {
                    string json = JsonConvert.SerializeObject(payload);
                    streamWriter.Write(json);
                    streamWriter.Flush();
                }

                var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
                using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    result = streamReader.ReadToEnd();
                }
            }
            catch (Exception ex)
            {
            }
        }
    }
}
