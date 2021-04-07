let alpine = {
  start() {
    this.root = document.querySelector("[x-data]");
    this.rawData = this.getRawData();
    this.data = this.getReactiveData(this.rawData);
    //define directives here
    this.directives = {
      "x-text": function (el, value) {
        el.innerHTML = value; //get rawData scope and call like a variable
      },
      "x-show": function (el, value) {
        el.style.display = value ? "block" : "none";
      },
    };
    this.refreshDom(); //initial refresh
    this.listenEvents();
  },
  getRawData() {
    let dataStringObj = this.root.getAttribute("x-data");
    return eval(`(${dataStringObj})`);
  },
  getReactiveData(rawData) {
    var self = this;
    return new Proxy(rawData, {
      set(rawData, key, value) {
        rawData[key] = value;
        self.refreshDom();
      },
    }); //when data change it call proxy set fucntion and update rawData
  },
  refreshDom() {
    this.iterateDomNodes(this.root, (el) => {
      //each root's element will iterate here
      Array.from(el.attributes).forEach((attribute) => {
        if (!Object.keys(this.directives).includes(attribute.name)) return;
        this.directives[attribute.name](
          el,
          eval(`with (this.rawData) ${attribute.value}`)
        );
      });
    });
  },
  iterateDomNodes(el, callback) {
    callback(el);
    el = el.firstElementChild;
    while (el) {
      this.iterateDomNodes(el, callback);
      el = el.nextElementSibling; //last dom tree sibling will be null,so the loop will stop
    }
  },
  listenEvents() {
    this.iterateDomNodes(this.root, (el) => {
      Array.from(el.attributes).forEach((attribute) => {
        if (!attribute.name.startsWith("@")) return;

        let event = attribute.name.replace("@", "");

        el.addEventListener(event, () => {
          eval(`with(this.data) ${attribute.value}`);
        });
      });
    });
  },
};

alpine.start();
