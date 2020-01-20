
import { mapGetters, mapActions } from "vuex";
import cryptoUtils from "../utils/cryptoUtils";
const maxCreateAmount = 100;
export default {
  data() {
    return {
      loading: false,
      amount: "",
      openDialog: false,
      dialogTitle: "",
      dialogContent: ""
    };
  },
  computed: {
    localComputed() {
      return true;
    },
    ...mapGetters([
      "isAuthenticated",
      "getKeypair",
      "getServerUrl",
      "getAccount"
    ])
  },
  methods: {
    ...mapActions(["updateTabName"]),
    renderDialog(title, message) {
      this.openDialog = true;
      this.dialogTitle = title;
      this.dialogContent = message;
    },
    create() {
      const amount = parseInt(cryptoUtils.normaliseText(this.amount), 10);
      if (!amount || amount <= 0) {
        this.renderDialog("Invalid Amount", `Please input correct amount`);
      } else if (amount && amount <= maxCreateAmount) {
        this.loading = true;
        const serverUrl = this.getServerUrl;
        const account = this.getAccount;
        account.id = this.getKeypair.publicKey;
        let tx = cryptoUtils.buildTx({
          type: "create",
          from: {},
          to: { ...account, keys: this.getKeypair },
          amount
        });
        console.log(JSON.stringify(tx));
        cryptoUtils
          .send(serverUrl, tx)
          // .then(data => {
          //   this.loading = false;
          //   this.renderDialog(
          //     "Success",
          //     "Tx is successfully submitted to server !"
          //   );
          //   this.amount = "";
          //   this.updateTabName({ tabName: "Transactions" });
          // })
          .catch(e => {
            this.loading = false;
            this.renderDialog("Error", JSON.stringify(e.message));
          });
        this.loading = false;
        this.renderDialog("Success", "Tx is submitted to Shardus network !");
        this.amount = "";
        this.updateTabName({ tabName: "Transactions" });
      } else {
        this.renderDialog(
          "Invalid Amount",
          `Cannot create more than ${maxCreateAmount} coins at a time`
        );
      }
    }
  }
};
</script>


