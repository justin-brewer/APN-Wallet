import { mapGetters } from "vuex";
export default {
  data() {
    return {
      loading: false
    };
  },
  computed: {
    localComputed() {
      return true;
    },
    ...mapGetters(["isAuthenticated", "getKeypair"])
  },
  methods: {}
};

