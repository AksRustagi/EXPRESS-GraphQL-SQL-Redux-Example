import {ImageType} from '../GraphQL/ImageQuery';
import {expect} from 'chai';
import {GraphQLString} from 'graphql';
import {agent} from 'supertest';
import {app, server} from '../server';
import * as assert from 'assert';
import {ImagesSequelize, LikesSequelize, UsersSequelize} from '../database/Tables';
const agent1 = agent(app);
const createUserMutation = `
  mutation createUser($email:String!, $userName: String!, $password:String!) {
  addUserMutation(email: $email, userName:$userName, password:$password){
    userName,
    id,
    email
  }
}`;

const createImageMutation = `
mutation addImage ($url: String!, $title:String!, $description: String!) {
  postImageMutation(url:$url,title:$title,description:$description) {
    id,
    title,
    description,
  }
}`;

const addLikeMutation = `
mutation addLike($image_id: String!){
  addLikeMutation(image_id:$image_id) {
  id,
    user_id,
    image_id
  }
}`;
const removeLikeMutation = `
mutation RemoveLike ($identifier: String!){
  removeLikeMutation(identifier: $identifier) {
    id,
    user_id,
    image_id
  }
}
`;
const fetchPins = `
query imageList ($indexOffset: Int!){
  imagesListGraphQL(indexOffset: $indexOffset){
    id,
    title,
    url,
    description,
    userName,
    user_id,
    totalLikes,
    avatar,
  }
}
`;
const createDatabaseEntries = (user) => {
    for (let i = 0; i < 100; i++) {
        ImagesSequelize.create({
            url: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=256%C3%97180&w=256&h=180',
            description: `this is image ${i}`,
            title: `title of image ${i}`,
            userName: user.twitterUsername,
            avatar: 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
            user_id: user.id
        })
            .catch(e => console.log(e));
    }

};
const imageFind = (title) => ImagesSequelize.findOne({
    where: {
        title
    }
});

const userFind = (userName) => UsersSequelize.findOne({
    where: {
        userName
    }
});

const GraphQLQuery = () => agent1.post('/graphql');

describe('testing graphql fields', () => {
    it('should get a field and test its type', () => {
        expect(ImageType.getFields()).to.have.property('id');
        expect(ImageType.getFields().id.type).to.deep.equals(GraphQLString);
    });
});

describe('testing graphql resolve functions', () => {

    it('should resolve create user', () => {
        return GraphQLQuery().send({
            query: createUserMutation,
            variables: {email: 'hello@hello.com', userName: 'hello', password: 'ciao'}
        }).then((res) => assert.deepEqual(res.body.data.addUserMutation.userName, 'hello'));
    });

    it('should log in', () => {
        return agent1.post('/login')
            .send({username: 'hello', password: 'ciao'})
            .then((res) => assert.deepEqual(res.body.login, true, 'there should be a boolean true indicating successful login'));
    });

    it('should create an image', () => {
        return GraphQLQuery()
            .send({
                query: createImageMutation,
                variables: {url: 'http://heythere', title: 'test1', description: 'a good test'}
            })
            .then(res =>
                assert.deepEqual(res.body.data.postImageMutation.title, 'test1', 'there should be the title of the image'));
    });

    it('should create a like entry', async () => {

        const image: any = await imageFind('test1');

        const like = await GraphQLQuery()
            .send({
                query: addLikeMutation,
                variables: {image_id: image.id}
            })
            .then(res => res.body.data.addLikeMutation);

        const imageAfter: any = await imageFind('test1');

        assert.deepEqual(like.image_id, image.id, 'there should be the ID of the image that has been liked');
        assert.deepEqual(imageAfter.totalLikes, 1, 'there should be a like');
    });

    it('should remove a like', async () => {
        const image: any = await imageFind('test1');
        const user: any = await userFind('hello');
        const deletedLikeID = await GraphQLQuery()
            .send({
                query: removeLikeMutation,
                variables: {identifier: user.id.concat(image.id)}
            })
            .then(res => res.body.data.removeLikeMutation.id);
        const imageAfter: any = await imageFind('test1');
        const findDeletedLike = await LikesSequelize.findById(deletedLikeID);

        assert.deepEqual(imageAfter.totalLikes, 0, 'the total likes should be 0 after the like removal');
        assert.notDeepEqual(deletedLikeID, null, 'there should be the ID of the like removed from the DB');
        assert.deepEqual(findDeletedLike, null, 'the like should not be present into the DB after its removal');
    });
});

describe(' testing GraphQL queries', () => {

    const fetchImages = () => GraphQLQuery()
        .send({
            query: fetchPins,
            variables: {indexOffset: 0}
        })
        .then(res => res.body.data.imagesListGraphQL)

    before('creating a batch of images to operate with', async () => {
        const user: any = await userFind('hello');
        createDatabaseEntries(user);

    });

   it('should retrieve the images list', async () => {
        const imagesArray =  await fetchImages();
        assert.deepEqual(imagesArray.length, 24);
    });

    it('should retrieve the images through redis', async () => {
        const imagesArray = await fetchImages();
        assert.deepEqual(imagesArray.length, 24);

    });
});

server.close();


// sdadasa