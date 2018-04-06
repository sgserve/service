
# sgsc
sgsc是一款三国杀资源替换工具

## install

```
npm install -g sgsc
```

#### Config
你需要修改 `config.yaml` 文件，将要替换的地址编辑在这个文件里面。格式参考例子。

```
- /220/assets/simplified/DianJiang/55.png
- /220/assets/simplified/DianJiang/56.png
- /220/assets/simplified/GeneralSkinPreview/15k.png
- /220/assets/winnerGeneral/full/18700.swf #王异第一个武将大图
- /220/assets/simplified/GeneralSkinPreview/18702p.png # 王异传说小图
- /220/assets/simplified/GeneralSkinPreview/18702p.swf # 王异传说动态
- /220/assets/videoskin/xinwangyi02Big.f4v #传说动态预览
- /220/assets/videoskin/xinwangyi02.swf # 传说动态牌局内
- /220/assets/videoskin/diaochan07.swf #替换成最新的貂蝉限定动态 牌局内   146x172
- /220/assets/videoskin/diaochan07Big.f4v #替换成最新的貂蝉限定动态 武将预览

```
#### Start to use
你需要使用 `sudo` 运行此命令，开启一个80端口。
```
sgsc start
```

#### Other

| Command          | Explain                             |
| -------------    | -------------                       |
| `sgsc start`    | Start the sgsc service               |
| `sgsc stop`     | Stop the sgsc services               |
| `sgsc reload`   | Reload the url configuration file |
| `sgsc path`     | View the installation directory     |
| `sgsc -v`       | View version                        |

## License
[MIT](./LICENSE) license
