import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import BackgroundWrapper from '@/components/BackgroundWrapper'
import { PieChart, BarChart } from 'react-native-chart-kit'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const EventStatistics = () => {
    const { id } = useLocalSearchParams()

    const eventData = {
        title: "Concert de la Renaissance",
        totalTickets: 500,
        ticketsSold: 375,
        revenue: 12500000, 
        ticketTypes: [
            { name: "VIP", sold: 75, color: "#FFC107" },
            { name: "Standard", sold: 250, color: "#4CAF50" },
        ],
        salesTimeline: [
            { day: "01/08", tickets: 50 },
            { day: "02/08", tickets: 75 },
            { day: "03/08", tickets: 40 },
            { day: "04/08", tickets: 90 },
            { day: "05/08", tickets: 120 }
        ],
        paymentMethods: [
            {
                name: "Bankily",
                transactions: 180,
                amount: 6500000,
                color: "#4A90E2",
                icon: "phone-portrait"
            },
            {
                name: "Masrvi",
                transactions: 120,
                amount: 4000000,
                color: "#50E3C2",
                icon: "phone-portrait"
            },
            {
                name: "Bimbank",
                transactions: 75,
                amount: 2000000,
                color: "#E35050",
                icon: "phone-portrait"
            }
        ]
    }

    const occupancyRate = Math.round((eventData.ticketsSold / eventData.totalTickets) * 100)
    const revenuePerTicket = Math.round(eventData.revenue / eventData.ticketsSold)

    const pieData = eventData.ticketTypes.map(type => ({
        name: type.name,
        population: type.sold,
        color: type.color,
        legendFontColor: "#FFF",
        legendFontSize: 14
    }))

    const paymentData = eventData.paymentMethods.map(method => ({
        name: method.name,
        population: method.transactions,
        amount: method.amount,
        color: method.color,
        legendFontColor: "#FFF",
        legendFontSize: 14
    }))

    const barData = {
        labels: eventData.salesTimeline.map(item => item.day),
        datasets: [{
            data: eventData.salesTimeline.map(item => item.tickets)
        }]
    }

    const chartConfig = {
        backgroundGradientFrom: "#1e293b",
        backgroundGradientTo: "#0f172a",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(104, 242, 244, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#68f2f4"
        }
    }

    return (
        <BackgroundWrapper>
            <ScrollView className="flex-1 px-4 pt-16 pb-36">
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={28} color="#68f2f4" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold text-center flex-1">
                            Statistique d'evenement
                        </Text>
                        <View style={{ width: 28 }} />
                    </View>
                    <Text className="text-teal-400 text-xl font-semibold">
                        {eventData.title}
                    </Text>
                </View>

                <View className="flex-row flex-wrap justify-between mb-6">
                    <StatCard
                        icon="ticket"
                        title="Tickets vendus"
                        value={`${eventData.ticketsSold}/${eventData.totalTickets}`}
                    />
                    <StatCard
                        icon="podium"
                        title="Taux de remplissage"
                        value={`${occupancyRate}%`}
                    />
                    <StatCard
                        icon="cash"
                        title="Revenu total"
                        value={`${(eventData.revenue / 1000).toFixed(0)}k MRO`}
                    />
                    <StatCard
                        icon="analytics"
                        title="Moyenne/ticket"
                        value={`${revenuePerTicket} MRO`}
                    />
                </View>

                <View className="bg-white/10 rounded-2xl p-4 mb-6">
                    <Text className="text-white text-lg font-bold mb-4">
                        Répartition des tickets
                    </Text>
                    <PieChart
                        data={pieData}
                        width={Dimensions.get('window').width - 48}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                </View>


                <View className="bg-white/10 rounded-2xl p-4 mb-6">
                    <Text className="text-white text-lg font-bold mb-4">
                        Répartition des paiements
                    </Text>

                    <PieChart
                        data={paymentData}
                        width={Dimensions.get('window').width - 48}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />

                    <View className="mt-4">
                        {eventData.paymentMethods.map((method, index) => (
                            <View
                                key={index}
                                className="flex-row justify-between items-center py-3 border-b border-white/20"
                            >
                                <View className="flex-row items-center">
                                    <View
                                        className="w-4 h-4 rounded-full mr-3"
                                        style={{ backgroundColor: method.color }}
                                    />
                                    <Ionicons name={method.icon} size={18} color="#68f2f4" />
                                    <Text className="text-white ml-2">{method.name}</Text>
                                </View>

                                <View className="items-end">
                                    <Text className="text-teal-400 font-medium">
                                        {method.transactions} transactions
                                    </Text>
                                    <Text className="text-amber-400 text-sm mt-1">
                                        {(method.amount / 1000).toFixed(0)}k MRO
                                    </Text>
                                </View>
                            </View>
                        ))}

                        <View className="flex-row justify-between items-center pt-3">
                            <Text className="text-white font-bold">Total</Text>
                            <View className="items-end">
                                <Text className="text-teal-400 font-bold">
                                    {eventData.paymentMethods.reduce((sum, method) => sum + method.transactions, 0)} transactions
                                </Text>
                                <Text className="text-amber-400 font-bold text-base">
                                    {(eventData.paymentMethods.reduce((sum, method) => sum + method.amount, 0) / 1000).toFixed(0)}k MRO
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="bg-white/10 rounded-2xl p-4">
                    <Text className="text-white text-lg font-bold mb-4">
                        Performance par catégorie
                    </Text>
                    {eventData.ticketTypes.map((type, index) => (
                        <View
                            key={index}
                            className="flex-row justify-between items-center py-3 border-b border-white/20"
                        >
                            <View className="flex-row items-center">
                                <View
                                    className="w-4 h-4 rounded-full mr-3"
                                    style={{ backgroundColor: type.color }}
                                />
                                <Text className="text-white">{type.name}</Text>
                            </View>
                            <Text className="text-teal-400 font-medium">
                                {type.sold} tickets ({Math.round((type.sold / eventData.ticketsSold) * 100)}%)
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </BackgroundWrapper>
    )
}

const StatCard = ({ icon, title, value }: { icon: string, title: string, value: string }) => (
    <View className="bg-white/10 rounded-2xl p-4 mb-4 w-[48%]">
        <View className="flex-row items-center mb-2">
            <Ionicons name={icon} size={20} color="#68f2f4" />
            <Text className="text-teal-400 ml-2 text-sm">{title}</Text>
        </View>
        <Text className="text-white text-xl font-bold">{value}</Text>
    </View>
)

export default EventStatistics