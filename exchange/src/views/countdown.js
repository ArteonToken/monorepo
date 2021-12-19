export default customElements.define('countdown-view', class CountdownView extends BaseClass {
  constructor() {
    super()
  }

  get _min() {
    return 60000
  }

  get _hour() {
    return 60
  }

  get _day() {
    return 24
  }

  set value(ms) {
    ms = Number(ms)
    if (ms > this._min) {
      this.min = ms /  1000
      if (this.min > this._hour) {
        const result = String(this.min / 60).split('.')
        this.hours = result[0]
        this.min = result[1]
      }
      if (this.hours > this._day) {
        const result = String(this.hours / 24).split('.')
        this.days = result[0]
        this.hours = result[1]
      }
    }

    this.shadowRoot.innerHTML = this.template
  }

  get template() {
    return html`
${this.days > 0 ? `<span class="days">${this.days}</span>`: '0'}
${this.hours > 0 ? `<span class="hours">${this.hours}</span>`: '0'}
${this.minutes > 0 ? `<span class="min">${this.minutes}</span>`: '0'}
    `
  }
})
