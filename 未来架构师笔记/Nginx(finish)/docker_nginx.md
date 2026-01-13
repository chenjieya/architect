# 安装运行

**_拉取镜像_**

```
docker pull nginx
```

**_运行脚本_**
nginx添加数据卷后，并不会自动复制数据（很智障），所以需要手动复制

```shell
# 先运行一个不添加卷的nginx
docker run -d --name testNginx -p 80:80 nginx

#查到testNginx的ID
docker ps
# 复制容器内数据到本地机上，注意复制后的目录多一级，手动调整一下即可
docker cp [container id]:/etc/nginx /docker_volumes/nginx/conf
docker cp [container id]:/usr/share/nginx/html /docker_volumes/nginx

# 删除临时的nginx
docker rm -f [container id]

```

启动正式的nginx

```shell
docker run -d \
--name nginx \
-p 1080:1080 \
-p 180:80 \
-p 1443:443 \
-v /home/lke/DockerVolumes/nginx/conf:/etc/nginx \
-v /home/lke/DockerVolumes/nginx/logs:/var/log/nginx \
-v /home/lke/DockerVolumes/nginx/html:/usr/share/nginx/html \
--restart always \
--net mynet \
nginx
# --restart always \
# --link portainer \
# --net=host
# --volumes-from nextcloud \
```

**_测试_**
修改本地机上的/html/index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to nginx!</title>
    <style>
      html {
        color-scheme: light dark;
      }
      body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
      }
    </style>
  </head>
  <body>
    <h1>Welcome to nginx!XXX</h1>
    <p>
      If you see this page, the nginx web server is successfully installed and
      working. Further configuration is required.
    </p>

    <p>
      For online documentation and support please refer to
      <a href="http://nginx.org/">nginx.org</a>.<br />
      Commercial support is available at
      <a href="http://nginx.com/">nginx.com</a>.
    </p>

    <p><em>Thank you for using nginx.</em></p>
  </body>
</html>
```

查看结果，有变化即为成功

# 使用

**_进入nginx容器内部_**

```shell
docker exec -it [container id] /bin/bash
```

```shell
docker run -d \
--name blog \
-p 80:80 \
-p 443:443 \
-v /project/docker/blog/conf:/etc/nginx \
-v /project/docker/blog/logs:/var/log/nginx \
-v /project/docker/blog/html:/usr/share/nginx/html \
-v /project/docker/blog/ssl:/etc/nginx/ssl \
-v /project/docker/blog/cerbot:/usr/share/nginx/cerbot \
--restart always \
nginx
```

```shell
docker run -it --rm --name certbot \
            -v /project/docker/blog/ssl/wiseinsightai/certbot/etc/letsencrypt:/etc/letsencrypt \
            -v /project/docker/blog/ssl/wiseinsightai/certbot/var/lib/letsencrpt:/var/lib/letsencrypt \
            -v /project/docker/blog/ssl/wiseinsightai/certbot/var/log/letsencrpt:/var/log/letsencrypt \
            -v /project/docker/blog/cerbot:/data/letsencrypt \
            certbot/certbot certonly  \
            --webroot  \
            --webroot-path=/data/letsencrypt \
            --agree-tos -m chenjie.goodday@gmail.com -d alvis.org.cn
```

```shell

docker run -it --rm --name certbot \
            -v /project/docker/blog/ssl/wiseinsightai/certbot/etc/letsencrypt:/etc/letsencrypt \
            -v /project/docker/blog/ssl/wiseinsightai/certbot/var/lib/letsencrpt:/var/lib/letsencrypt \
            -v /project/docker/blog/ssl/wiseinsightai/certbot/var/log/letsencrpt:/var/log/letsencrypt \
            -v /project/docker/blog/cerbot:/data/letsencrypt \
            certbot/certbot  renew
```
