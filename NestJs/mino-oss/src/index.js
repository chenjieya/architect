var Minio = require("minio");

const fs = require("fs");

var minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "jie.chen",
  secretKey: "chenjie+00"
});

// 上传文件
async function put() {
  // 文件路径
  const sourceFile = "./temp/98-34.png";

  // 存储桶
  const bucket = "test";

  // 上传到存储到的文件名称
  const destinationObject = "code.png";

  // Check if the bucket exists
  // If it doesn't, create it
  const exists = await minioClient.bucketExists(bucket);
  if (exists) {
    console.log("Bucket " + bucket + " exists.");
  } else {
    await minioClient.makeBucket(bucket, "us-east-1");
    console.log("Bucket " + bucket + ' created in "us-east-1".');
  }

  // Set the object metadata
  // var metaData = {
  //   "Content-Type": "image/png",
  //   "X-Amz-Meta-Testing": 1234,
  //   example: 5678
  // };

  // Upload the file with fPutObject
  // If an object with the same name exists,
  // it is updated with new data
  // await minioClient.fPutObject(bucket, destinationObject, sourceFile, metaData);
  await minioClient.fPutObject(bucket, destinationObject, sourceFile);
  console.log(
    "File " +
      sourceFile +
      " uploaded as object " +
      destinationObject +
      " in bucket " +
      bucket
  );

  // minioClient.fPutObject(
  //   "aaa",
  //   "hello.png",
  //   "./smile.png",
  //   function (err, etag) {
  //     if (err) return console.log(err);
  //     console.log("上传成功");
  //   }
  // );
}

// put();

// 下载存储桶的文件
function get() {
  minioClient.getObject("test", "code.png", (err, stream) => {
    if (err) return console.log(err);
    stream.pipe(fs.createWriteStream("./xxx.png"));
  });
}

get();
