import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { shortnameToUnicode } from 'emoji-toolkit';
import equal from 'deep-equal';
import { connect } from 'react-redux';
import orderBy from 'lodash/orderBy';
import { sanitizedRaw } from '@nozbe/watermelondb/RawRecord';

import TabBar from './TabBar';
import EmojiCategory from './EmojiCategory';
import styles from './styles';
import categories from './categories';
import database from '../../lib/database';
import { emojisByCategory } from '../../emojis';
import protectedFunction from '../../lib/methods/helpers/protectedFunction';
import log from '../../utils/log';

const scrollProps = {
	keyboardShouldPersistTaps: 'always',
	keyboardDismissMode: 'none'
};

class EmojiPicker extends Component {
	static propTypes = {
		baseUrl: PropTypes.string.isRequired,
		customEmojis: PropTypes.object,
		onEmojiSelected: PropTypes.func,
		tabEmojiStyle: PropTypes.object
	};

	constructor(props) {
		super(props);
		const customEmojis = Object.keys(props.customEmojis)
			.filter(item => item === props.customEmojis[item].name)
			.map(item => ({
				content: props.customEmojis[item].name,
				extension: props.customEmojis[item].extension,
				isCustom: true
			}));
		this.state = {
			frequentlyUsed: [],
			customEmojis,
			show: false,
			width: null
		};
	}

	async componentDidMount() {
		await this.updateFrequentlyUsed();
		this.setState({ show: true });
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { frequentlyUsed, show, width } = this.state;
		if (nextState.show !== show) {
			return true;
		}
		if (nextState.width !== width) {
			return true;
		}
		if (!equal(nextState.frequentlyUsed, frequentlyUsed)) {
			return true;
		}
		return false;
	}

	onEmojiSelected = (emoji) => {
		try {
			const { onEmojiSelected } = this.props;
			if (emoji.isCustom) {
				this._addFrequentlyUsed({
					content: emoji.content, extension: emoji.extension, isCustom: true
				});
				onEmojiSelected(`:${ emoji.content }:`);
			} else {
				const content = emoji;
				this._addFrequentlyUsed({ content, isCustom: false });
				const shortname = `:${ emoji }:`;
				onEmojiSelected(shortnameToUnicode(shortname), shortname);
			}
		} catch (e) {
			log(e);
		}
	}

	// eslint-disable-next-line react/sort-comp
	_addFrequentlyUsed = protectedFunction(async(emoji) => {
		const db = database.active;
		const freqEmojiCollection = db.collections.get('frequently_used_emojis');
		let freqEmojiRecord;
		try {
			freqEmojiRecord = await freqEmojiCollection.find(emoji.content);
		} catch (error) {
			// Do nothing
		}

		await db.action(async() => {
			if (freqEmojiRecord) {
				await freqEmojiRecord.update((f) => {
					f.count += 1;
				});
			} else {
				await freqEmojiCollection.create((f) => {
					f._raw = sanitizedRaw({ id: emoji.content }, freqEmojiCollection.schema);
					Object.assign(f, emoji);
					f.count = 1;
				});
			}
		});
	})

	updateFrequentlyUsed = async() => {
		const db = database.active;
		const frequentlyUsedRecords = await db.collections.get('frequently_used_emojis').query().fetch();
		let frequentlyUsed = orderBy(frequentlyUsedRecords, ['count'], ['desc']);
		frequentlyUsed = frequentlyUsed.map((item) => {
			if (item.isCustom) {
				return { content: item.content, extension: item.extension, isCustom: item.isCustom };
			}
			return shortnameToUnicode(`${ item.content }`);
		});
		this.setState({ frequentlyUsed });
	}

	onLayout = ({ nativeEvent: { layout: { width } } }) => this.setState({ width });

	renderCategory(category, i, label) {
		const { frequentlyUsed, customEmojis, width } = this.state;
		const { baseUrl } = this.props;

		let emojis = [];
		if (i === 0) {
			emojis = frequentlyUsed;
		} else if (i === 1) {
			emojis = customEmojis;
		} else {
			emojis = emojisByCategory[category];
		}
		return (
			<EmojiCategory
				emojis={emojis}
				onEmojiSelected={emoji => this.onEmojiSelected(emoji)}
				style={styles.categoryContainer}
				width={width}
				baseUrl={baseUrl}
				tabLabel={label}
			/>
		);
	}

	render() {
		const { show, frequentlyUsed } = this.state;
		const { tabEmojiStyle } = this.props;

		if (!show) {
			return null;
		}
		return (
			<View onLayout={this.onLayout} style={{ flex: 1 }}>
				<ScrollableTabView
					renderTabBar={() => <TabBar tabEmojiStyle={tabEmojiStyle} />}
					contentProps={scrollProps}
					style={styles.background}
				>
					{
						categories.tabs.map((tab, i) => (
							(i === 0 && frequentlyUsed.length === 0) ? null // when no frequentlyUsed don't show the tab
								: (
									this.renderCategory(tab.category, i, tab.tabLabel)
								)))
					}
				</ScrollableTabView>
			</View>
		);
	}
}

const mapStateToProps = state => ({
	customEmojis: state.customEmojis
});

export default connect(mapStateToProps)(EmojiPicker);
