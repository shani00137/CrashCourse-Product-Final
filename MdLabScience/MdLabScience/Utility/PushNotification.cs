using Nancy.Json;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;

namespace MdLabScience.Utility
{
    public class PushNotification
    {
        public static void  PushNotificationTOuser(String Token, String ResponseMessage, String alert)
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
                        titleLocKey="block",

                    },

                    data = new
                    {
                        info = "Crush App"
                    },
                    to = Token,
                    priority = "high",
                    content_available = true,

                };


                var serializer = new JavaScriptSerializer();

                using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
                {
                    string json = serializer.Serialize(payload);
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
            //try
            //{
            //    var applicationID = "1:887812884206:android:95e180d4c1b5bc4685d5ff";

            //    var senderId = "887812884206";

            //    string deviceId = "fcIFELxkR2WEgznJjFbwLw:APA91bHs4oIv8mSFXnnLvTfq3FN0mmxManjLTvMVbEWdsGTp_Z8NZ1ql8VHwyXKsY--zWGxBTr0SForOdrBrCQ4U4TUsr8qubLyNa-279-N7hp7Hxu_52_wAitHEgOo9jsvZ415CZVH-";

            //    WebRequest tRequest = WebRequest.Create("https://fcm.googleapis.com/fcm/send");

            //    tRequest.Method = "post";

            //    tRequest.ContentType = "application/json";

            //    var data = new

            //    {

            //        to = deviceId,

            //        notification = new

            //        {

            //            body = "Ed",

            //            title = "ed",

            //            icon = "myicon"

            //        }
            //    };

            //    var serializer = new JavaScriptSerializer();

            //    var json = serializer.Serialize(data);

            //    Byte[] byteArray = Encoding.UTF8.GetBytes(json);

            //    tRequest.Headers.Add(string.Format("Authorization", "Key=" + applicationID));

            //    tRequest.Headers.Add(string.Format("Sender: id={0}", senderId));

            //    tRequest.ContentLength = byteArray.Length;


            //    using (Stream dataStream = tRequest.GetRequestStream())
            //    {

            //        dataStream.Write(byteArray, 0, byteArray.Length);


            //        using (WebResponse tResponse = tRequest.GetResponse())
            //        {

            //            using (Stream dataStreamResponse = tResponse.GetResponseStream())
            //            {

            //                using (StreamReader tReader = new StreamReader(dataStreamResponse))
            //                {

            //                    String sResponseFromServer = tReader.ReadToEnd();

            //                    string str = sResponseFromServer;

            //                }
            //            }
            //        }
            //    }
            //}

            //catch (Exception ex)
            //{

            //    string str = ex.Message;

            //}

        }
        public static void PushNotificationScreenShot(String Token, String ResponseMessage, String alert,String ImagePath)
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
                    fcm_options=new {
                        image = "http://crashcourseonlin.net/" + ImagePath
                    },

                to = Token,
                    priority = "high",
                    content_available = true,

                };


                var serializer = new JavaScriptSerializer();

                using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
                {
                    string json = serializer.Serialize(payload);
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