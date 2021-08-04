import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import export_icon from "../../../assets/images/export_icon.png";
import input_edit from "../../../assets/images/input_edit.png";
import txArrow from "../../../assets/images/txArrow.png";
import { WALLET_CHANGE_ACCOUNT_NAME } from "../../../constant/types";
import { ACCOUNT_TYPE, SEC_DELETE_ACCOUNT, SEC_SHOW_PRIVATE_KEY } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { sendMsg } from "../../../utils/commonMsg";
import { copyText, getPrettyAddress, nameLengthCheck } from "../../../utils/utils";
import Button from "../../component/Button";
import CustomInput from "../../component/CustomInput";
import CustomView from "../../component/CustomView";
import TestModal from "../../component/TestModal";
import Toast from "../../component/Toast";
import "./index.scss";


class AccountInfo extends React.Component {
  constructor(props) {
    super(props);
    let account = props.cache.accountInfo
    this.state = {
      confirmModal: false,
      account,
      accountName: account.accountName,
      inputAccountName: "",
      errorTipShow: false,
      btnClick: false
    };
    this.modal = React.createRef();
    this.isUnMounted = false;
  }

  componentWillUnmount() {
    this.isUnMounted = true;
  }
  callSetState = (data, callback) => {
    if (!this.isUnMounted) {
      this.setState({
        ...data
      }, () => {
        callback && callback()
      })
    }
  }
  renderInfo = (title, content, callback, hideArrow) => {
    return (
      <div className={cx({
        "account-info-item": true,
      })}
        onClick={() => callback && callback()}>
        <div className="account-info-item-inner click-cursor">
          <p className="account-info-title">{title}</p>
          {content && <p className={
            cx({
              "account-info-content": true,
            })
          }>{content}</p>}
        </div>
        <img className={
          cx({
            "account-info-arrow": true,
            "account-info-arrow-hide": hideArrow
          })

        } src={txArrow} />
      </div>
    )
  }

  changeAccountName = (e) => {
    this.modal.current.setModalVisable(true)
  }
  onCloseModal = () => {
    this.modal.current.setModalVisable(false)
  }
  showPrivateKey = () => {
    this.props.history.push({
      pathname: "/security_pwd_page",
      params: {
        nextRoute: "/show_privatekey_page",
        action: SEC_SHOW_PRIVATE_KEY,
        address: this.state.account.address,
      }
    }
    )
  }
  deleteAccount = () => {
    this.props.history.push({
      pathname: "/security_pwd_page",
      params: {
        action: SEC_DELETE_ACCOUNT,
        nextRoute: "/account_manage",
        address: this.state.account.address,
        nextParams: {
          title: getLanguage('backup_success_title'),
          content: getLanguage('deleteAccountSuccess')
        }
      }
    }
    )
  }
  onChangeAccountName = () => {
    if (this.state.inputAccountName.length <= 0) {
      Toast.info(getLanguage('inputAccountName'))
      return
    }
    sendMsg({
      action: WALLET_CHANGE_ACCOUNT_NAME,
      payload: {
        address: this.state.account.address,
        accountName: this.state.inputAccountName
      }
    }, (account) => {
      if (!this.isUnMounted) {
        this.callSetState({
          account: account.account
        })
      }
      this.onCloseModal()
      Toast.info(getLanguage('changeSuccess'))
    })
  }
  renderActionBtn = () => {
    return (
      <div className={"account-info-btn-container"}>
        <Button
          content={getLanguage('confirm')}
          onClick={this.onChangeAccountName}
          propsClass={"account-common-btn"}
        />
        <Button
          content={getLanguage('cancel')}
          propsClass={"account-common-btn account-common-btn-cancel"}
          onClick={this.onCloseModal}
        />
      </div>
    )
  }
  onTextInput = (e) => {
    if (!this.isUnMounted) {
      this.callSetState({
        inputAccountName: e.target.value,
      }, () => {
        let checkResult = nameLengthCheck(this.state.inputAccountName)
        if (checkResult) {
          this.callSetState({
            btnClick: true,
            errorTipShow: false
          })
        } else {
          this.callSetState({
            btnClick: false,
            errorTipShow: true
          })
        }
      })
    }
  }
  onSubmit = (event) => {
    event.preventDefault();
  }
  renderInput = () => {
    return (
      <div className="change-input-wrapper">
        <CustomInput
          placeholder={this.state.account.accountName}
          value={this.state.inputAccountName}
          onTextInput={this.onTextInput}
          errorTipShow={this.state.errorTipShow}
          showTip={getLanguage("accountNameLimit")}
        />
      </div>)
  }
  renderChangeModal = () => {
    return (<TestModal
      ref={this.modal}
      showClose={true}
    >
      <div className={'account-change-name-container'}>
        <div className={"account-change-title-container"}>
          <p className={
            cx({ "account-change-name-title": true })
          }>{getLanguage('renameAccountName')}</p>
        </div>
        {this.renderInput()}
        {this.renderActionBtn()}
      </div>
    </TestModal>)
  }
  copyAddress = () => {
    copyText(this.state.account.address).then(() => {
      Toast.info(getLanguage('copySuccess'))
    })
  }
  onClickItem = (callback) => {
    callback && callback()
  }
  renderCommonShowItem = (title, content, callback, showEdit = false) => {
    return (
      <div className={cx({
        "click-cursor": callback
      })} onClick={() => { this.onClickItem(callback) }}>
        <p className={"account-info-title"}>{title}</p>
        <div className={cx("account-info-content-container", {
          "account-info-common": !callback
        })}>
          <p className={"account-info-content"}>{content}</p>
          {showEdit && <div className={"account-info-img-container"}>
            <img className={"account-info-img"} src={input_edit} />
          </div>}
        </div>
      </div>
    )
  }
  renderExportPrivateKey = () => {
    let showPrivateKey = this.state.account.type === ACCOUNT_TYPE.WALLET_INSIDE || this.state.account.type === ACCOUNT_TYPE.WALLET_OUTSIDE
    if (!showPrivateKey) {
      return (<></>)
    }
    return (<div className={"account-info-export click-cursor"} onClick={this.showPrivateKey}>
      <img className={"account-private-export"} src={export_icon} />
      <p className={"account-private-text"}>{getLanguage('exportPrivateKey')}</p>
    </div>)
  }
  renderDeleteAccount = () => {
    return (<div className={"account-bottom-container click-cursor"} onClick={this.deleteAccount}>
      <div className={"account-info-delete-container"}>
        <p className={'account-info-delete-content'}>{getLanguage("accountDelete")}</p>
      </div>
    </div>)
  }
  render() {
    let showDelete = this.state.account.type !== ACCOUNT_TYPE.WALLET_INSIDE
    let showAddress = getPrettyAddress(this.state.account.address)
    return (
      <CustomView
        title={getLanguage('accountInfo')}
        history={this.props.history}>
        <div className="account-info-container">
          {this.renderCommonShowItem(getLanguage("accountAddress"), showAddress, this.copyAddress)}
          {this.renderCommonShowItem(getLanguage("accountName"), this.state.account.accountName, this.changeAccountName, true)}

          {this.renderExportPrivateKey()}
        </div>
        {showDelete && this.renderDeleteAccount()}
        <form onSubmit={this.onSubmit}>
          {this.renderChangeModal()}
        </form>
      </CustomView>)
  }
}

const mapStateToProps = (state) => ({
  cache: state.cache
});

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountInfo);