import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    toLoad: true,
    loadingMore: false,
    refreshing: false,
  };

  componentDidMount() {
    this.setState({ loading: true });
    this.load();
  }

  load = async (page = 1) => {
    const { stars } = this.state;
    const { navigation } = this.props;

    const user = navigation.getParam('user');

    if (page > 1) this.setState({ loadingMore: true });

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    if (response.data.length === 0)
      this.setState({ toLoad: false, loadingMore: false });

    this.setState({
      stars: page > 1 ? [...stars, ...response.data] : response.data,
      loading: false,
      loadingMore: false,
      page,
    });
  };

  loadMore = () => {
    const { page, toLoad } = this.state;

    if (toLoad) {
      const incrementPage = page + 1;
      this.load(incrementPage);
    }
  };

  refreshList = () => {
    this.setState({
      stars: [],
      loading: false,
      page: 1,
      toLoad: true,
      loadingMore: false,
      refreshing: false,
    });
    this.load();
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, loadingMore, refreshing } = this.state;
    const user = navigation.getParam('user');
    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading ? (
          <ActivityIndicator color="#666" />
        ) : (
          <Stars
            onRefresh={this.refreshList}
            refreshing={refreshing}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
        {loadingMore && <ActivityIndicator color="#666" />}
      </Container>
    );
  }
}
