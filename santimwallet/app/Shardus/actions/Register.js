import firebase from "firebase";
import { mapActions, mapGetters } from "vuex";
import cryptoUtils from "../utils/cryptoUtils";
export default {
  name: "login",
  data() {
    return {
      email: "",
      password: "",
      confirmPassword: "",
      loading: false,
      openDialog: false,
      dialogTitle: "",
      dialogContent: ""
    };
  },
  computed: {
    ...mapGetters([
      "getAuthStatus",
      "getKeypair",
      "getServerUrl",
      "getAccount",
      "getUpdateStatus",
      "getTxList"
    ])
  },
  methods: {
    ...mapActions([
      "updateAuthStatus",
      "updateKeypair",
      "updateAccount",
      "loadAccount"
    ]),
    renderDialog(title, message) {
      this.openDialog = true;
      this.dialogTitle = title;
      this.dialogContent = message;
    },
    register: async function() {
      if (this.password !== this.confirmPassword) {
        this.renderDialog(
          "Password Not Matching",
          "Please make sure passwords are matching."
        );
        return;
      }
      this.loading = true;
      firebase
        .auth()
        .createUserWithEmailAndPassword(
          cryptoUtils.normaliseText(this.email),
          cryptoUtils.normaliseText(this.password)
        )
        .then(
          async user => {
            this.loading = false;
            await this.loadAccount();
            this.updateAuthStatus({ isAuthenticated: true });
            this.$router.replace("home");
          },
          err => {
            this.loading = false;
            this.renderDialog("Oops", err.message);
          }
        );
    }
  }
};
