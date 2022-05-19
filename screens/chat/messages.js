const messages = [
    // {
    //   _id: 1,
    //   text: 'Alex Weins has declined your invitation.\nYou may message them for further information',
    //   createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
    //   system: true,
    // },
    {
      _id: 1,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      createdAt: new Date(Date.UTC(2016, 5, 12, 17, 20, 0)),
      user: {
        _id: 1,
        name: 'React Native',
        avatar: 'https://placeimg.com/140/140/any',
      },
    },
    {
      _id: 2,
      text: 'Etiam convallis risus diam, sed tincidunt turpis cursus eget. Fusce iaculis urna a orci mattis, eu mollis lacus facilisis.',
      createdAt: new Date(Date.UTC(2016, 5, 12, 17, 20, 0)),
      user: {
        _id: 2,
        name: 'React Native',
        avatar: 'https://i.pravatar.cc/150?img=8',
      },
    },
    // {
    //   _id: 3,
    //   // text: 'Hi! I work from home today!',
    //   createdAt: new Date(Date.UTC(2016, 5, 13, 17, 20, 0)),
    //   user: {
    //     _id: 1,
    //     name: 'React Native',
    //     avatar: 'https://placeimg.com/140/140/any',
    //   },
    //   image: 'https://placeimg.com/960/540/any',
    // },
    // {
    //   _id: 4,
    //   text: 'This is a quick reply. Do you love Gifted Chat? (radio) KEEP IT',
    //   createdAt: new Date(Date.UTC(2016, 5, 14, 17, 20, 0)),
    //   user: {
    //     _id: 2,
    //     name: 'React Native',
    //     avatar: 'https://placeimg.com/140/140/any',
    //   },
    //   quickReplies: {
    //     type: 'radio', // or 'checkbox',
    //     keepIt: true,
    //     values: [
    //       {
    //         title: '😋 Yes',
    //         value: 'yes',
    //       },
    //       {
    //         title: '📷 Yes, let me show you with a picture!',
    //         value: 'yes_picture',
    //       },
    //       {
    //         title: '😞 Nope. What?',
    //         value: 'no',
    //       },
    //     ],
    //   },
    // },
    // {
    //   _id: 5,
    //   text: 'This is a quick reply. Do you love Gifted Chat? (checkbox)',
    //   createdAt: new Date(Date.UTC(2016, 5, 15, 17, 20, 0)),
    //   user: {
    //     _id: 2,
    //     name: 'React Native',
    //     avatar: 'https://placeimg.com/140/140/any',
    //   },
    //   quickReplies: {
    //     type: 'checkbox', // or 'radio',
    //     values: [
    //       {
    //         title: 'Yes',
    //         value: 'yes',
    //       },
    //       {
    //         title: 'Yes, let me show you with a picture!',
    //         value: 'yes_picture',
    //       },
    //       {
    //         title: 'Nope. What?',
    //         value: 'no',
    //       },
    //     ],
    //   },
    // },
    {
      _id: 6,
      text: 'Proin pretium metus eu mi varius convallis. Nunc pulvinar, lectus a consectetur imperdiet, ligula dui semper neque, quis convallis mi risus vel ligula. Vestibulum lacinia tortor eget mi lobortis, ac suscipit nunc porta. Morbi sed gravida nisi.',
      createdAt: new Date(Date.UTC(2016, 5, 15, 18, 20, 0)),
      user: {
        _id: 2,
        name: 'React Native',
        avatar: 'https://i.pravatar.cc/150?img=8',
      },
    },
    {
      _id: 7,
      text: 'Nam eget urna orci.',
      createdAt: new Date(Date.UTC(2016, 5, 15, 18, 22, 0)),
      user: {
        _id: 1,
        name: 'React Native',
        avatar: 'https://i.pravatar.cc/150?img=7',
      },
    },
    // {
    //   _id: 8,
    //   text: `Hello this is an example of the ParsedText, links like http://www.google.com or http://www.facebook.com are clickable and phone number 444-555-6666 can call too.
    //       But you can also do more with this package, for example Bob will change style and David too. foo@gmail.com
    //       And the magic number is 42!
    //       #react #react-native`,
    //   createdAt: new Date(Date.UTC(2016, 5, 13, 17, 20, 0)),
    //   user: {
    //     _id: 1,
    //     name: 'React Native',
    //     avatar: 'https://placeimg.com/140/140/any',
    //   },
    // },
  ];
  
  export default messages;