import { mapGetters } from "vuex";
import Transaction from "@/components/Transaction.vue";
export default {
  components: { Transaction },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "getTxList", "getAccount"]),
    txList() {
      let originalTxList = this.getTxList.map(tx => tx);
      let txList = [];
      for (let i = 0; i < originalTxList.length; i += 1) {
        const isSelfTransfer =
          originalTxList[i].srcAct === originalTxList[i].tgtAct;
        if (isSelfTransfer) {
          txList.push({
            ...originalTxList[i],
            type: "received from"
          });
        }
        txList.push(originalTxList[i]);
      }
      return txList.sort((a, b) => b.txnTimestamp - a.txnTimestamp);
    }
  }
};
