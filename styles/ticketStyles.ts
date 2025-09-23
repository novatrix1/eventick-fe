import { StyleSheet, Dimensions } from 'react-native';

const CARD_WIDTH = Dimensions.get('window').width * 0.88;
const CARD_RADIUS = 22;

export const ticketStyles = StyleSheet.create({
  cardShadowContainer: {
    width: CARD_WIDTH + 18,
    borderRadius: CARD_RADIUS + 10,
    backgroundColor: "rgba(0,0,0,0.22)",
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  ticketCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    position: "relative",
    marginLeft: -19
  },
  notch: {
    position: "absolute",
    top: "44%",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#0E5661",
    zIndex: 2,
  },
  notchLeft: {
    left: -13,
  },
  notchRight: {
    right: -13,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 1.6,
    backgroundColor: "#EAEAEA",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: "#0B0B0B",
    textAlign: 'center',
  },
  divider: {
    marginVertical: 14,
    height: 1,
    backgroundColor: "#E9E9E9",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 12,
    justifyContent: "space-between",
  },
  infoItem: {
    width: (CARD_WIDTH - 40 - 12) / 2,
  },
  label: {
    color: "#8B8B8B",
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "600",
  },
  value: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "700",
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
});