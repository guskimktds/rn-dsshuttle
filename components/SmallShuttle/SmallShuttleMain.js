import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, FlatList, Alert, Platform, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PropTypes from 'prop-types'
//import SafeAreaView from "react-native-safe-area-view";
import { SafeAreaView } from "react-native";
import CardView from 'react-native-cardview';
import SlidingUpPanel from 'rn-sliding-up-panel'
import moment from 'moment-timezone';
import 'moment/locale/ko';
import RNCalendarEvents from 'react-native-calendar-events';
import AndroidOpenSettings from 'react-native-android-open-settings'

const Tab1 = 'bundangToBangbae'
const Tab2 = 'bangbaeToBundang'
const shuttleTimes = {
    bundang: [
        {
            title: '09:00',
            isAvailable: true
        },
        {
            title: '10:00',
            isAvailable: true
        },
        {
            title: '11:00',
            isAvailable: true
        },
        {
            title: '13:00',
            isAvailable: false
        },
        {
            title: '14:00',
            isAvailable: true
        },
        {
            title: '15:00',
            isAvailable: true
        },
        {
            title: '16:00',
            isAvailable: true
        },
        {
            title: '17:00',
            isAvailable: true
        },
    ],
    bangbae: [
        {
            title: '09:00',
            isAvailable: true
        },
        {
            title: '10:00',
            isAvailable: true
        },
        {
            title: '11:00',
            isAvailable: true
        },
        {
            title: '13:00',
            isAvailable: true
        },
        {
            title: '14:00',
            isAvailable: true
        },
        {
            title: '15:00',
            isAvailable: true
        },
        {
            title: '16:00',
            isAvailable: true
        },
        {
            title: '17:00',
            isAvailable: false
        },
    ]
}

export default class SmallShuttleMain extends Component {
    _panel;

    static defaultProps = {
        draggableRange: {
            top: 280 + 50,  // + tab height : 50
            bottom: 0
        },
        type: Tab1
    }

    static navigationOptions = {
        title: "?????? ??????",
        headerStyle: {
            // display: "none",
            backgroundColor: '#4baec5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            color: '#fff'
        },
    };

    state = {
        _clickedIndex: 0,
        refreshing: false
    }


    componentWillReceiveProps(nextProps) {
    }

    componentDidMount() {
        this.setState({

        });
    }

    //???????????? ?????? dy
    _goItemReg = (data,location) => {
        this.props.navigation.navigate('ItemReg', {data:data,location:location})
    }

    //???????????? ?????? dy
     _goItemList = (timeData,location) => {
        this.props.navigation.navigate('ItemList',{timeData:timeData,location:location})
    }

    _onMenuClicked = (index) => {
        Alert.alert('_onMenuClicked' + index);
    }

    _onLeftButtonclicked = (index) => {

        this.setState({
            _clickedIndex: index
        })
        this._panel.show();
    }

    _linkAppSettings = () => {
        Linking.canOpenURL('app-settings:').then(supported => {
            if (!supported) {
                console.log('Can\'t handle settings url');
            } else {
                return Linking.openURL('app-settings:');
            }
        }).catch(err => console.error('An error occurred', err));
    }


    _requestPermission = (index) => {

        RNCalendarEvents.authorizeEventStore().then(response => {
            // authorized =>  ?????? ???
            // denied => ?????? ???
            // restricted => ios : ?????? ???????????? ??????, android : ?????? ?????? ?????? ????????? ??????
            // undetermined => ?????? ???????????? ??????
            if (Platform.OS === 'android') {
                if (response == 'restricted') {
                    DefaultPreference.get('isSetCalendarDisAgree').then(function (value) {
                        if (value == 'true') {
                            // ?????? ?????? ???????????? ???????????? ????????? ??????
                        }
                        else {
                            Alert.alert(
                                '????????? ?????? ??????',
                                '????????? ????????? ?????? ?????? ???????????? 10?????? ?????? ????????? ???????????? ??? ????????????.\n\n?????? ?????? ???????????? \'???????????? ??????\'??? ????????? ??? \'??????\'???????????? ?????? ????????? ??????????????????.',
                                [
                                    {
                                        text: '?????? ?????? ??????',
                                        onPress: () => DefaultPreference.set('isSetCalendarDisAgree', 'true').then(function () { console.log('done') }),
                                        style: 'cancel',
                                    },
                                    {
                                        text: '???????????? ??????',
                                        onPress: () => AndroidOpenSettings.appDetailsSettings(),
                                    },
                                ],
                            )
                        }
                    })
                }
                else if (response == 'authorized') {  // ????????? ??????
                    this._onRightButtonclicked(index)
                }
                else if (response == 'denied') {  // ????????? ??????
                    Alert.alert(
                        '????????? ?????? ??????',
                        '????????? ????????? ?????? ?????? ???????????? 10?????? ?????? ????????? ???????????? ??? ????????????.',
                        [
                            {
                                text: '??????',
                            },
                        ],
                    )
                }
                else { // undetermined

                }
            }
            else {
                if (response == 'restricted') {
                    this._onRightButtonclicked(index)
                }
                else if (response == 'authorized') {
                    this._onRightButtonclicked(index)
                }
                else if (response == 'denied') {
                    Alert.alert(
                        '????????? ?????? ??????',
                        '????????? ????????? ?????? ?????? ???????????? 10?????? ?????? ????????? ???????????? ??? ????????????.',
                        [
                            {
                                text: '??????',
                            },

                            {
                                text: '???????????? ??????',
                                onPress: () => this._linkAppSettings()
                            },
                        ],
                    )
                }
                else { // undetermined

                }

            }

            this.setState({ calendarPermission: response })
        })
    }


    // ?????? ?????? ?????? ??? ?????? ?????? ??? ????????? ?????? ???????????? ?????? ??????
    _onRightButtonclicked = (index) => {

        RNCalendarEvents.authorizationStatus().then(response => {
            if (response != 'authorized') {
                this._requestPermission(index);
            }
            else {
                // ?????? ????????? ?????? ?????? ??????
                var timezoneOffset = new Date().getTimezoneOffset() * 60000;
                var timestamp = new Date(Date.now() + timezoneOffset);

                var start = moment(timestamp).tz('Asia/Seoul');
                var end = moment(timestamp).tz('Asia/Seoul');
                var alarm = moment(timestamp).tz('Asia/Seoul');

                switch (index) {
                    case 0:  // 09:00
                        start.set('hour', 8)
                        end.set('hour', 9)
                        alarm.set('hour', 8)

                        break;
                    case 1:  // 10:00
                        start.set('hour', 9)
                        end.set('hour', 10)
                        alarm.set('hour', 9)
                        break;
                    case 2:  // 11:00
                        start.set('hour', 10)
                        end.set('hour', 11)
                        alarm.set('hour', 10)
                        break;
                    case 3:  // 13:00
                        start.set('hour', 12)
                        end.set('hour', 13)
                        alarm.set('hour', 12)
                        break;
                    case 4:  // 14:00
                        start.set('hour', 13)
                        end.set('hour', 14)
                        alarm.set('hour', 13)
                        break;
                    case 5:  // 15:00
                        start.set('hour', 14)
                        end.set('hour', 15)
                        alarm.set('hour', 14)
                        break;
                    case 6:  // 16:00
                        start.set('hour', 15)
                        end.set('hour', 16)
                        alarm.set('hour', 15)
                        break;
                    case 7:  // 17:00
                        start.set('hour', 16)
                        end.set('hour', 17)
                        alarm.set('hour', 16)
                        break;
                    default:
                        break;
                }
                start.set('minute', 55)
                start.set('second', 0)
                start.set('millisecond', 0)

                end.set('minute', 0)
                end.set('second', 0)
                end.set('millisecond', 0)

                alarm.set('minute', 50)
                alarm.set('second', 0)
                alarm.set('millisecond', 0)

                let alarmMin;

                if (Platform.OS === 'android') {
                    alarmMin = 5;
                }
                else {  // ios
                    alarmMin = alarm.toISOString();
                }

                RNCalendarEvents.saveEvent('KT DS ?????? 10??? ??? ??????', {
                    startDate: start.toISOString(), // '2019-04-08T16:32:00.000Z'??? ??????
                    endDate: end.toISOString(),
                    alarms:
                        [{
                            date: alarmMin
                        }]
                })

                Alert.alert(
                    '??????',
                    '???????????? ?????????????????????.'
                )
            }
        }).catch(function (err) {
            Alert.alert('err : ' + err);
        })
    }

    // ?????? ?????? ?????? ????????? ???????????? ???????????? ???????????? ?????? ??????
    _isPassedTime(index) {
        let retVal = false;

        let t1;
        let t2 = moment();

        switch (index) {
            case 0:  // 09:00
                t1 = moment('09:00', 'HH:mm')
                break;
            case 1:  // 10:00
                t1 = moment('10:00', 'HH:mm')
                break;
            case 2:  // 11:00
                t1 = moment('11:00', 'HH:mm')
                break;
            case 3:  // 13:00
                t1 = moment('13:00', 'HH:mm')
                break;
            case 4:  // 14:00
                t1 = moment('14:00', 'HH:mm')
                break;
            case 5:  // 15:00
                t1 = moment('15:00', 'HH:mm')
                break;
            case 6:  // 16:00
                t1 = moment('16:00', 'HH:mm')
                break;
            case 7:  // 17:00
                t1 = moment('17:00', 'HH:mm')
                break;
            default:
                break;
        }
        if (t2.format('HH:mm') > t1.format('HH:mm'))
            retVal = true;

        return retVal;
        // return false;
    }

    _renderItem = (item, index, isTab2) => {

        const isPassed = this._isPassedTime(index);
        let color = '#fff';
        if (isPassed) {
            color = '#bbb'
        }

        return (
            <CardView
                cardElevation={2}
                cardMaxElevation={2}
                style={[styles.row, { backgroundColor: color }]}
                cornerRadius={3}>
                {(!item.isAvailable || isPassed)?
                    <TouchableOpacity
                        style={styles.leftButtonStyle}
                        activeOpacity={0.7}>
                        <Icon style={{ justifyContent: 'center', alignItems: 'center' }} name="lead-pencil" size={28} color="#5e5e5e" />
                    </TouchableOpacity>
                    :
                    <TouchableOpacity
                        style={styles.leftButtonStyle}
                        activeOpacity={0.7}
                        onPress={() => this._onLeftButtonclicked(index)}>
                        <Icon style={{ justifyContent: 'center', alignItems: 'center' }} name="lead-pencil" size={28} color="#4baec5" />
                    </TouchableOpacity>
                }

                {!item.isAvailable?
                    <Text style={[styles.centerSubTextStyle, { color: '#5e5e5e' }]}>
                        {item.title + ' ????????????'}
                    </Text>
                    :
                    <Text style={styles.centerTextStyle}>
                        {item.title + ' ??????'}
                    </Text>
                }

                {(!item.isAvailable || isPassed) ?
                    <TouchableOpacity
                        style={styles.rightButtonStyle}
                        activeOpacity={0.7}>
                        <Icon style={{ justifyContent: 'center', alignItems: 'center' }} name="alarm" size={28} color="#5e5e5e" />
                    </TouchableOpacity>
                    :
                    <TouchableOpacity
                        style={styles.rightButtonStyle}
                        activeOpacity={0.7}
                        onPress={() => this._onRightButtonclicked(index)}>
                        <Icon style={{ justifyContent: 'center', alignItems: 'center' }} name="alarm" size={28} color="#4baec5" />
                    </TouchableOpacity>
                }
            </CardView>
        )
    }


    _onRefresh = () => {
        // somethis Todo
        // setTimeout(function () {

        // }, 1000);


        this.setState(state => ({
            // ...state,
            refreshing: false
        }))
    }

    render() {
        const { _clickedIndex, refreshing } = this.state;
        const { type } = this.props;

        let isTab2 = false;
        if (type == Tab2) {
            isTab2 = true;
        }

        return (
            <View style={styles.container}>
                <FlatList
                    refreshing={refreshing}
                    onRefresh={this._onRefresh}
                    style={{ flex: 1 }}
                    keyExtractor={(item, index) => 'key' + index}
                    data={isTab2 ? shuttleTimes.bangbae : shuttleTimes.bundang}
                    renderItem={({ item, index }) =>
                        this._renderItem(item, index, isTab2)
                    }
                />
                {/* ???????????? ?????????, ??????, ????????? ?????? ?????? ??? ???????????? ?????? ?????? */}
                <SlidingUpPanel
                    allowDragging={false}
                    showBackdrop={true}
                    allowMomentum={true}
                    // minimumDistanceThreshold={0.5}
                    minimumVelocityThreshold={0.01}
                    friction={0.5}
                    ref={c => (this._panel = c)}
                    // onDragEnd={(value) => this._setVisible(value)}
                    // style={{ position: 'relative' }}
                    draggableRange={this.props.draggableRange}
                >
                    <SafeAreaView forceInset={{ bottom: 'always' }} style={[styles.container]}>
                        <View style={{ backgroundColor: '#fff', justifyContent: 'flex-start' }}>
                            <Text style={{
                                marginLeft: 20,
                                color: '#333',
                                marginTop: 10,
                                textAlignVertical: 'top',
                                fontSize: 12,
                                height: 15,
                                textAlign: 'left'
                            }}>
                                {isTab2 ? shuttleTimes.bangbae[_clickedIndex].title : shuttleTimes.bundang[_clickedIndex].title}
                            </Text>

                            <TouchableOpacity style={{ alignItems: 'center', marginLeft: 30, flexDirection: 'row', height: 40, marginTop: 10 }}
                                activeOpacity={0.3}
                                onPress={() => this._goItemReg(isTab2 ? shuttleTimes.bangbae[_clickedIndex].title : shuttleTimes.bundang[_clickedIndex].title , isTab2? "??????->??????" : "??????->??????")}>
                                <Icon style={{
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                    name="cube-send"
                                    size={24}
                                    color="#333" />
                                <Text style={{
                                    marginLeft: 5,
                                    color: 'black',
                                    textAlignVertical: "center",
                                    fontSize: 14,
                                    textAlign: 'left'
                                }}>???????????? ?????????</Text>
                            </TouchableOpacity>


                            <TouchableOpacity style={{ alignItems: 'center', marginLeft: 30, flexDirection: 'row', height: 40, marginTop: 10 }}
                                activeOpacity={0.3}
                                onPress={() => this._goItemList(isTab2 ? shuttleTimes.bangbae[_clickedIndex].title : shuttleTimes.bundang[_clickedIndex].title , isTab2? "??????->??????" : "??????->??????")}>
                                <Icon style={{
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                    name="feature-search"
                                    size={24}
                                    color="#333" />
                                <Text style={{
                                    marginLeft: 5,
                                    color: 'black',
                                    textAlignVertical: "center",
                                    fontSize: 14,
                                    textAlign: 'left'
                                }}>???????????? ??????</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ alignItems: 'center', marginLeft: 30, flexDirection: 'row', height: 40, marginTop: 10 }}
                                activeOpacity={0.3}
                                onPress={() => this._onMenuClicked(2)}>
                                <Icon style={{
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                    name="lead-pencil"
                                    size={24}
                                    color="#333" />
                                <Text style={{
                                    marginLeft: 5,
                                    color: 'black',
                                    textAlignVertical: "center",
                                    fontSize: 14,
                                    textAlign: 'left'
                                }}>??????????????? ??????</Text>
                            </TouchableOpacity>
                        </View>
                        {/* <View style={[styles.container]}>
                        </View> */}
                    </SafeAreaView>
                </SlidingUpPanel>

            </View >
        );
    }
}

// prop??? ?????? ??????
SmallShuttleMain.propTypes = {
    draggableRange: PropTypes.object,
    type: PropTypes.oneOf([Tab1, Tab2])
}


const styles = StyleSheet.create({
    rightButtonStyle: {
        height: 50,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },

    leftButtonStyle: {
        height: 50,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },

    centerTextStyle: {
        color: 'black',
        flex: 1,
        textAlign: 'center',
        textAlignVertical: "center",
        fontWeight: 'bold',
        fontSize: 20,
    },

    centerSubTextStyle: {
        color: '#5e5e5e',
        flex: 1,
        textAlign: 'center',
        textAlignVertical: "center",
        fontWeight: 'bold',
        fontSize: 20,
    },


    row: {
        flex: 1,
        padding: 10,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 3,
        marginBottom: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',

    },

    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'flex-start'

    },

});
