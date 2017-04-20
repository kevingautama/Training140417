using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Net.Http;
using System.Web.Http;

namespace Training140417.Controllers
{
    public class uploadController : ApiController
    {
        private Training170417Entities entity = new Training170417Entities();

        [HttpPost]
        [Route("api/upload/DataUpload/{obj}")]
        public string DataUpload(string obj)
        {

            if (HttpContext.Current.Request.Files.AllKeys.Any())
            {
                var httpPostedFile = HttpContext.Current.Request.Files["file"];



                var uploadfile = new uploadfile();


                uploadfile.filename = System.IO.Path.GetFileName(httpPostedFile.FileName);
                uploadfile.contenttype = httpPostedFile.ContentType;
                using (var reader = new System.IO.BinaryReader(httpPostedFile.InputStream))
                {
                    uploadfile.content = reader.ReadBytes(httpPostedFile.ContentLength);
                }

                entity.uploadfiles.Add(uploadfile);
                entity.SaveChanges();
                return "1";
            }
            return "0";
        }

     
    }
}
