// 抛个interesting的问题
function * oldTakeEvent (node) {
  node.addEventListener('click', function (e) {
    // 我想把e给yield出去，但是我不知道e什么时候会出现，即：回调什么时候会执行呢
  }, false)
}

// 问题的关键在于 ‘拉’ 的人不知道什么时候 ‘拉’ 才会有东西出来
// 单靠Generator好像无法解决这个问题啊，需要有一个有‘通知者’
// 模型要改是：‘通知者’ --> '有东西了，要拉的可以拉了' --> '拉动者' --> '好的，我来拉了'（当然，拉的人需要时常检测通知者的一举一动）
// 好的，那来修改下这个interesting的模型吧！

// 先看看最后的Genertor函数形态
// Usage:
function * takeEvent () {
  // 先引入监控者Monitor
  var monitor = getMonitor()
  // 盯着Monitor的一举一动啊
  while(true) {
    var e = yield monitor.take()
    // 拿到e了，TODO....
  }
}

// 很神奇吧，看看拖动者们都做来些啥吧
// 首先，我们需要把拉取的权限把露出来
// 原因：1.在Generator中我也没法知道啥时候‘e’会有值
//      2.拉取的过程应该保证用户的不可知，保持Generator尽量的纯净
export function disdatch (generator) {
  // takeEvent()返回实现[Symbol.iterator]接口的对象，所以Generator只是个不错的语法糖
  var iterator = generator()
  // 写的步调函数
  function step (e) {
    // 拉取数据
    // 注意：这里有个重点，一切之所以能实现，得益于next(args)能将args注入到函数体内
    var it = iterator.next(e)
    // 调用结束(return 或 Generator执行结束了)，这个Demo不存在这情况
    if (it.done) {
      return 
    }
    // 像平常一样，我们这时候只需要next.value，就可能取到相应的值，但是这里的 ‘数据源’ 是个异步，你并不知道它啥时候有值
    // 所以：我们还是要等Monitor来告诉我们，行吧，那就给个callback吧，什么时候有数据源了，再next
    var value = it.value
    value(function (e) {
      // 千幸万苦终于拿到想要的了，赶紧送给Generator吧
      step(e)
    })
  }

  return step
}

// 再来看看Monitor
export function getMonitor (node, event) {
  var taker = null

  function put (e) {
    // 确保已经有人在监听我了
    if (!taker) {
      return 
    }
    var _taker = taker
    // 防止每次的拉取者不是同一个
    taker = null
    // 赶紧把数据源发送给调用者
    _taker(e)
  }

  node.addEventListener([event], function (e) {
    // 监控到e了，赶紧抛出去
    put(e)
  }, false)

  return {
    take: () => (callback) => {
      // 很可惜，在这里我也不知道是不是已经有数据源了，只能把这个回调先保存下来了
      taker = e => callback(e)
    }
  }
}