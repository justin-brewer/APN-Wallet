import cryptoUtils from "../utils/cryptoUtils";
import VueQrcodeReader from "vue-qrcode-reader";
const defaultCamera = {
  audio: false, // don't request microphone access
  video: {
    facingMode: { ideal: "environment" }, // use rear camera if available
    width: { min: 360, ideal: 680, max: 1920 }, // constrain video width resolution
    height: { min: 240, ideal: 480, max: 1080 } // constrain video height resolution
  }
};

Vue.use(VueQrcodeReader);
export default {
  data() {
    return {
      loading: false,
      displayQrReader: false,
      pauseQrReader: false,
      amount: "",
      receiverAddress: "",
      camera: false,
      styleObject: {
        display: "none"
      },
      openDialog: false,
      dialogTitle: "",
      dialogContent: "",
      error: ""
    };
  },
  computed: {
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
    isValidHex(hex) {
      if (hex.length !== 64) return false;
      if (hex === "0".repeat(64)) return false;
      return true;
    },
    send() {
      const amount = parseInt(this.amount, 10);
      const account = this.getAccount;
      if (
        amount &&
        amount > 0 &&
        this.isValidHex(this.receiverAddress) &&
        account.data.balance >= amount
      ) {
        this.loading = true;
        const serverUrl = cryptoUtils.getServerUrlAddress( );
        const receiver = cryptoUtils.normaliseText(this.receiverAddress);
        let tx = cryptoUtils.buildTx({
          type: "transfer",
          from: { ...account, keys: this.getKeypair },
          to: { id: receiver },
          amount
        });
        cryptoUtils
          .send(serverUrl, tx)
          // .then(data => {
          //   this.loading = false;
          //   this.renderDialog(
          //     "Success",
          //     "Tx is successfully submitted to server !"
          //   );
          //   this.amount = "";
          //   this.receiverAddress = "";
          //   this.updateTabName({ tabName: "Transactions" });
          // })
          .catch(e => {
            this.loading = false;
            this.renderDialog("Error", e.message);
          });
        this.loading = false;
        this.renderDialog("Success", "Tx is submitted to Shardus network !");
        this.amount = "";
        this.receiverAddress = "";
        this.updateTabName({ tabName: "Transactions" });
      } else {
        this.renderDialog(
          "Error",
          "Invalid token amount or receiver address !"
        );
      }
    },
    toggleQrReader() {
      if (!this.displayQrReader) {
        this.displayQrReader = true;
        this.styleObject = {
          display: "block"
        };
        this.camera = defaultCamera;
        this.pauseQrReader = false;
      } else {
        this.displayQrReader = false;
        this.styleObject = {
          display: "none"
        };
        this.camera = false;
        this.pauseQrReader = true;
      }
    },
    onDecode(decodedString) {
      this.receiverAddress = decodedString;
      this.toggleQrReader();
    },
    renderQrReader() {
      if (this.displayQrReader) {
        return `<qrcode-stream @decode="onDecode" @init="onInit" :paused="pauseQrReader" :camera="camera"/>`;
      }
    },
    async onInit(promise) {
      try {
        await promise;
      } catch (error) {
        if (error.name === "NotAllowedError") {
          this.error = "ERROR: you need to grant camera access permisson";
        } else if (error.name === "NotFoundError") {
          this.error = "ERROR: no camera on this device";
        } else if (error.name === "NotSupportedError") {
          this.error = "ERROR: secure context required (HTTPS, localhost)";
        } else if (error.name === "NotReadableError") {
          this.error = "ERROR: is the camera already in use?";
        } else if (error.name === "OverconstrainedError") {
          this.error = "ERROR: installed cameras are not suitable";
        } else if (error.name === "StreamApiNotSupportedError") {
          this.error = "ERROR: Stream API is not supported in this browser";
        }
        this.renderDialog("QR Code Reader Error", this.error);
      }
    }
  }
};

