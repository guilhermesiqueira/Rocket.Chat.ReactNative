import { StyleSheet } from 'react-native';
import { COLOR_SEPARATOR, COLOR_BORDER, COLOR_DANGER } from '../../constants/colors';

import sharedStyles from '../Styles';

export default StyleSheet.create({
	contentContainer: {
		paddingBottom: 30
	},
	container: {
		flex: 1,
		backgroundColor: '#F6F7F9'
	},
	sectionItem: {
		paddingVertical: 16,
		flexDirection: 'row',
		alignItems: 'center'
	},
	sectionItemDisabled: {
		opacity: 0.3
	},
	sectionItemIcon: {
		width: 56,
		textAlign: 'center'
	},
	sectionItemName: {
		flex: 1,
		fontSize: 14,
		...sharedStyles.textRegular
	},
	sectionItemDescription: {
		fontSize: 14,
		...sharedStyles.textRegular
	},
	separator: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: COLOR_SEPARATOR
	},
	sectionSeparator: {
		height: 10,
		backgroundColor: '#F6F7F9'
	},
	sectionSeparatorBorder: {
		borderColor: COLOR_BORDER,
		borderTopWidth: 1
	},
	textColorDanger: {
		color: COLOR_DANGER
	},
	avatar: {
		marginHorizontal: 16
	},
	roomTitleContainer: {
		flex: 1
	},
	roomTitle: {
		fontSize: 16,
		...sharedStyles.textMedium
	},
	roomDescription: {
		fontSize: 13,
		...sharedStyles.textRegular
	},
	roomTitleRow: {
		flexDirection: 'row',
		alignItems: 'center'
	}
});
