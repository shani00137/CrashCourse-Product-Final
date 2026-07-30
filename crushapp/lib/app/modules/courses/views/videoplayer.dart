import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:video_player/video_player.dart';

import '../../../data/providers/api_Provider.dart';

class CrashVideoPlayer extends StatefulWidget {
  const CrashVideoPlayer({Key? key}) : super(key: key);

  @override
  _CrashVideoPlayerState createState() => _CrashVideoPlayerState();
}

class _CrashVideoPlayerState extends State<CrashVideoPlayer> {
  late VideoPlayerController _controller;
  var courseModel = Get.arguments;

  @override
  void initState() {

    _controller = VideoPlayerController.network(
        '${ApiProvide.appBaseUrl+courseModel.courseUrl}')
      ..initialize().then((_) {
        setState(() {});
      });
      
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return  WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
      body: Center(
        child: _controller.value.isInitialized
            ? AspectRatio(
                aspectRatio: _controller.value.aspectRatio,
                child: Stack(
                  alignment: Alignment.bottomCenter,
                  children: [
                    VideoPlayer(_controller, key: Key('video_player_key')),
                    VideoPlayerControls(controller: _controller),
                  ],
                ),
              )
            : CircularProgressIndicator(color: Colors.orange[500]),
      ),
    ));
  }

  @override
  void dispose() {
      SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    super.dispose();
    // _controller.dispose();
  }
    Future<bool> _onWillPop() async {
    if (_controller.value.isPlaying) {
      _controller.pause();
    }
    return true;
  }

}

class VideoPlayerControls extends StatefulWidget {
  final VideoPlayerController controller;

  const VideoPlayerControls({Key? key, required this.controller})
      : super(key: key);

  @override
  _VideoPlayerControlsState createState() => _VideoPlayerControlsState();
}

class _VideoPlayerControlsState extends State<VideoPlayerControls> {
  double _sliderValue = 0.0;
  @override
  void initState() {
    super.initState();

   // Listen for changes in the video player's position
    widget.controller.addListener(() {
      if (mounted) {
        setState(() {
          _sliderValue = widget.controller.value.position.inSeconds.toDouble();
        });
      }
    });
  }
  @override
  Widget build(BuildContext context) {
    return  Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
             if (widget.controller.value.isBuffering)
            CircularProgressIndicator(color: Colors.orange[500],)
          else
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                onPressed: () {
                  widget.controller.seekTo(widget.controller.value.position - const Duration(seconds: 10));
                },
                icon: const Icon(Icons.replay_10, color: Colors.orange,),
              ),
              IconButton(
                onPressed: () {
                  setState(() {
                    widget.controller.value.isPlaying ? widget.controller.pause() : widget.controller.play();
                   
                  });
              
                },
                icon: Icon(
                  widget.controller.value.isPlaying ? Icons.pause : Icons.play_arrow,
                  color: Colors.orange,
                  size: 40,
                ),
              ),
              IconButton(
                onPressed: () {
                  widget.controller.seekTo(widget.controller.value.position + const Duration(seconds: 10));
                },
                icon: const Icon(Icons.forward_10,color: Colors.orange),
              ),
            ],
          ),
          Slider(
            activeColor: Colors.orange[900],
            inactiveColor: Colors.orange[100],
            value: _sliderValue,
            min: 0.0,
            max: widget.controller.value.duration.inSeconds.toDouble(),
            onChanged: (value) {
              setState(() {
                _sliderValue = value;
                final newPosition = Duration(seconds: value.toInt());
                widget.controller.seekTo(newPosition);
              });
            },
          ),
        ],
       ),
    );
  }
  
}
