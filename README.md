# wenquan-dl

文泉学堂上的书本很难下载。运气好的时候，这个脚本能把文泉学堂上的书保存成 pdf 格式。

## 使用方法

在 Tampermonkey 里安装[这个脚本](https://greasyfork.org/en/scripts/550378-%E6%96%87%E6%B3%89%E5%AD%A6%E5%A0%82%E4%BF%9D%E6%8A%A4%E8%A3%85%E7%BD%AE)。

点击 Download 下载一些页面为 pdf，点击 Set scale 设置图片放大缩小倍率。

打开控制台（先点登陆再 F12 再返回）可以看到下载信息。下载功能封装在 dl 函数里，可以编程运行实现自动分段下载之类的功能。
