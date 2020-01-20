import Vue from 'vue'
import Vuex from 'vuex'

import VueAxios from 'vue-axios'
import axios from 'axios'
import cryptoUtils from '../utils/cryptoUtils.js'

Vue.use(Vuex)
Vue.use(VueAxios, axios)

export default new Vuex.Store({
  // You can use it as state property
  state: {
    isAuthenticated: '',
    keypair: null,
    account: {
      address: null,
      balance: 0,
      sequence: 0,
      keys: null
    },
    serverUrl: 'http://40.122.26.94:9001/',
    // serverUrl: 'http://localhost:9001/',
    txList: [],
    updated: false,
    tabName: 'Create',
    isRegistered: 'false'
  },

  // You can use it as a state getter function (probably the best solution)
  getters: {
    getAuthStatus(state) {
      return state.isAuthenticated
    },
    getKeypair(state) {
      return state.keypair
    },
    getIsRegistered(state) {
      return state.isRegistered
    },
    getServerUrl(state) {
      return state.serverUrl
    },
    getAccount(state) {
      return state.account
    },
    getUpdateStatus(state) {
      return state.updated
    },
    getTxList(state) {
      return state.txList
    },
    getTabName(state) {
      return state.tabName
    }
  },

  // Mutation for when you use it as state property
  mutations: {
    setAuthStatus(state, payload) {
      state.isAuthenticated = payload.isAuthenticated
    },
    setKeypair(state, payload) {
      state.keypair = payload.keypair
      localStorage.setItem('keypair', JSON.stringify(payload.keypair))
    },
    setIsRegistered(state, payload) {
      state.isRegistered = payload.isRegistered
      if (payload.isRegistered === true) localStorage.setItem('isRegistered', JSON.stringify(payload.isRegistered))
    },
    setAccount(state, payload) {
      state.account = payload.account
    },
    setTxList(state, payload) {
      state.txList = payload.txList
    },
    setUpdateStatus(state, payload) {
      state.updated = payload.updated
    },
    setServerUrl(state, payload) {
      state.serverUrl = payload.serverUrl
    },
    setTabName(state, payload) {
      state.tabName = payload.tabName
    }
  },

  actions: {
    createAccount(context, payload) {
      context.commit('setKeypair', payload)
    },
    async loadAccount(context) {
      let keypair
      const savedKeyPair = localStorage.getItem('keypair')
      if (JSON.parse(savedKeyPair)) keypair = JSON.parse(savedKeyPair)
      else {
        await cryptoUtils.init()
        keypair = await cryptoUtils.generateKeyPair()
      }
      context.commit('setKeypair', {
        keypair
      })
      context.commit('setAccount', {
        account: {
          address: keypair.publicKey,
          balance: 0,
          sequence: 0,
          keys: keypair
        }
      })
    },
    async loadLastSignIn(context) {
      const isRegistered = localStorage.getItem('isRegistered')
      if (JSON.parse(isRegistered)) {
        context.commit('setIsRegistered', {
          isRegistered: true
        })
      } else {
        context.commit('setIsRegistered', {
          isRegistered: false
        })
      }
    },
    updateAuthStatus(context, payload) {
      context.commit('setAuthStatus', payload)
    },
    updateKeypair(context, payload) {
      context.commit('setKeypair', payload)
    },
    updateAccount(context, payload) {
      context.commit('setAccount', payload)
    },
    updateTxList(context, payload) {
      context.commit('setTxList', payload)
    },
    updateServer(context, payload) {
      context.commit('setServerUrl', payload)
    },
    updateStatus(context, payload) {
      context.commit('setUpdateStatus', payload)
    },
    updateTabName(context, payload) {
      context.commit('setTabName', payload)
    },
    resetTxList(context, payload) {
      context.commit('setTxList', {
        txList: []
      })
    }
  }
})
