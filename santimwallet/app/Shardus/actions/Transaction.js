import { mapGetters } from 'vuex'
import moment from 'moment'
export default {
  data () {
    return {
      loading: false
    }
  },
  props: ['transaction'],
  computed: {
    ...mapGetters(['getAccount']),
    getTxType () {
      let address = this.getAccount.address
      let transaction = this.transaction
      if (transaction.type) return transaction.type
      if (transaction.type === 'create') return 'created'
      if (transaction.type === 'transfer' && transaction.from === address) return 'sent to'
      return 'received from'
    },
    getDate () {
      return moment(this.transaction.txnTimestamp).calendar()
    },
    amountSign () {
      if (this.getTxType === 'sent to') return '-'
      else return '+'
    },
    amountColor () {
      if (this.getTxType === 'sent to') return 'orange'
      else return '#448aff'
    },
    isSelfTxn () {
      return this.transaction.srcAct === this.transaction.tgtAct
    }
  }
}
